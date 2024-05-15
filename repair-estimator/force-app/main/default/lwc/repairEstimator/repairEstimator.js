import { LightningElement, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { createRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import saveRepairEstimateLineItems from '@salesforce/apex/RepairEstimationController.saveRepairEstimateLineItems';

import WORK_ORDER_OBJECT from '@salesforce/schema/WorkOrder';
import REPAIR_ESTIMATE_LINE_ITEM from '@salesforce/schema/Repair_Estimate_Line_Item__c'

export default class RepairEstimator extends LightningElement {
    repairLineItems = [{Description__c: '', Type__c: 'Materials', Price__c: 0, Notes__c: '', Id: this.generateUniqueId()}];
    workOrderId;
    estimateStarted = false;
    savingBlocked = false;
    changesSaved = true;

    // Match based on the Subject (describing the repair) and the Location Name
    workOrderMatchingInfo = {
        primaryField: { fieldPath: 'Subject' },
        additionalFields: [{ fieldPath: 'Location.Name' }],
    };

    // Display the Location Name and the Subject (Work Order Number may be appropriate here as well - you can only display two fields, so we'd have to pick 2 of the 3 using this component)
    workOrderDisplayInfo = {
        primaryField: 'Subject',
        additionalFields: ['Location.Name']
    };

    // Filter we build based on Record Type and user input for selecting a Work Order
    // Getter since we wait on getObjectInfo
    get workOrderFilter() {
        return {
            criteria: [
                {
                    fieldPath: 'RecordTypeId',
                    operator: 'eq',
                    value: this.recordTypeId || '',
                }
            ],
            filterLogic: '1',
        }
    }

    get workOrderSelectDisabled() {
        return !!this.workOrderId && this.estimateStarted;
    }

    get allDisabled() {
        return !this.workOrderId || !this.estimateStarted;
    }

    get createDisabled() {
        return !this.workOrderId || this.estimateStarted;
    }

    get saveAndDeleteDisabled() {
        return this.allDisabled || this.savingBlocked;
    }

    get totalPrice() {
        return this.repairLineItems.reduce((accumulator, item) => {
            return accumulator + (parseInt(item.Price__c, 10) || 0);
        }, 0) || 0;
    }

    get computedSaveStateClass() {
        return this.changesSaved ? 'slds-text-color_success' : 'slds-text-color_error';
    }

    recordTypeId;

    @wire(getObjectInfo, { objectApiName: WORK_ORDER_OBJECT })
    objectInfo({ error, data }) {
        if (data) {
            // Get the record type ID for "Repair Request"
            const recordTypeInfos = data.recordTypeInfos;
            this.recordTypeId = Object.keys(recordTypeInfos).find(recordTypeId => recordTypeInfos[recordTypeId].name === 'Repair Request');
        } else if (error) {
            // Handle error
            console.error(error);
        }
    }

    // Found online - probably a better solution to this, I'd like to use UUID but I'd rather not include it in the package
    // Good enough for this project
    generateUniqueId() {
        return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    }

    handleWorkOrderSelect(e) {
        this.workOrderId = e.detail.recordId;
    }

    handleCreateEstimate() {
        const initialLineItem = {
            apiName: REPAIR_ESTIMATE_LINE_ITEM.objectApiName,
            fields : {
              Description__c: '',
              Type__c: 'Materials',
              Price__c: 0,
              Notes__c: '',
              Repair_Work_Order__c: this.workOrderId
            }
          }
        createRecord(initialLineItem).then((record) => {
            this.repairLineItems = [{...initialLineItem.fields, Id: record.id}];
            this.estimateStarted = true;
        })
    }

    handleSaveEstimate() {
        this.savingBlocked = true;
        saveRepairEstimateLineItems({jsonLineItems: JSON.stringify(this.repairLineItems)})
            .then(() => {
                this.changesSaved = true;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Repair estimate saved successfully',
                        variant: 'success'
                    })
                );
            })
            .catch((error) => {
                console.error(error);
            }).finally(() => {
                this.savingBlocked = false;
            })
    }

    // Have to recreate the array with spread operator for it to recognize the change
    // Can also use JSON.parse(JSON.stringify(obj)) for this if its deeply nested - it's an approved way of doing so to my knowledge, and relatively efficient
    // Some defaults set - we use the API names of the fields to make it easier to manage saving - if this was in a managed packaged, we'd have to pull field names from schema, due to namespace, but it's not.
    handleAddItem() {
        const newLineItem = {
            apiName: REPAIR_ESTIMATE_LINE_ITEM.objectApiName,
            fields : {
              Description__c: '',
              Type__c: 'Materials',
              Price__c: 0,
              Notes__c: '',
              Repair_Work_Order__c: this.workOrderId
            }
        }
        const tempId = this.generateUniqueId();
        this.repairLineItems = [...this.repairLineItems, {...newLineItem.fields, Id: tempId}];
        this.savingBlocked = true;
        createRecord(newLineItem)
            .then((record) => {
                this.repairLineItems.find((item) => {
                    return item.Id === tempId;
                }).Id = record.id;
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                this.savingBlocked = false;
            })
    }

    // Use a map for the same reason above - to ensure the tracked property picks up on changes.
    handleChangeItemValues(e) {
        this.changesSaved = false;
        this.repairLineItems = this.repairLineItems.map(lineItem => {
            if (lineItem.Id === e.detail.id) {
                return { ...lineItem, [e.detail.fieldName]: e.detail.value };
            }
            return lineItem;
        });
    }

    handleDeleteItem(e) {
        this.savingBlocked = true;
        this.repairLineItems = this.repairLineItems.filter(lineItem => {
            return lineItem.Id !== e.detail.id;
        });
        deleteRecord(e.detail.id).then(() => {
            this.savingBlocked = false;
        }).catch((error) => {
            console.error(error);
        }).finally(() => {
            this.savingBlocked = false;
        })
    }
}