import { LightningElement, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { createRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';

import WORK_ORDER_OBJECT from '@salesforce/schema/WorkOrder';
import REPAIR_ESTIMATE_LINE_ITEM from '@salesforce/schema/Repair_Estimate_Line_Item__c'

export default class RepairEstimator extends LightningElement {
    repairLineItems = [{name: '', type: 'Materials', price: 0, notes: '', id: this.generateUniqueId()}];
    workOrderId;
    estimateStarted = false;
    savingBlocked = false;
    

    // Match based on the Subject (describing the repair) and the Location Name
    workOrderMatchingInfo = {
        primaryField: { fieldPath: 'Subject' },
        additionalFields: [{ fieldPath: 'Location.Name' }],
    };

    // Display the Location Name and the Subject (Work Order Number may be appropriate here as well - you can only display two fields, so we'd have to pick 2 of the 3 using this component)
    workOrderDisplayInfo = {
        primaryField: 'Location.Name',
        additionalFields: ['Subject']
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

    get allDisabled() {
        return !this.workOrderId || !this.estimateStarted;
    }

    get createDisabled() {
        return !this.workOrderId || this.estimateStarted;
    }

    get saveAndDeleteDisabled() {
        return this.allDisabled || this.savingBlocked;
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
            this.repairLineItems = [{...initialLineItem.fields, id: record.id}];
            this.estimateStarted = true;
        })
    }

    handleSaveEstimate() {
        
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
        this.repairLineItems = [...this.repairLineItems, {...newLineItem.fields, id: tempId}];
        this.savingBlocked = true;
        createRecord(newLineItem)
            .then((record) => {
                this.repairLineItems.find((item) => {
                    return item.id === tempId;
                }).id = record.id;
                this.savingBlocked = false;
            })
            .catch((error) => {
                console.error(error);
            })
    }

    // Use a map for the same reason above - to ensure the tracked property picks up on changes.
    handleChangeItemValues(e) {
        this.repairLineItems = this.repairLineItems.map(lineItem => {
            if (lineItem.id === e.detail.id) {
                return { ...lineItem, [e.detail.fieldName]: e.detail.value };
            }
            return lineItem;
        });
    }

    handleDeleteItem(e) {
        this.savingBlocked = true;
        this.repairLineItems = this.repairLineItems.filter(lineItem => {
            return lineItem.id !== e.detail.id;
        });
        deleteRecord(e.detail.id).then(() => {
            this.savingBlocked = false;
        }).catch((error) => {
            console.error(error);
        })
    }
}