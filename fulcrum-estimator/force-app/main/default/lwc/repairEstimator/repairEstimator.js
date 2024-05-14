import { LightningElement, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import WORK_ORDER_OBJECT from '@salesforce/schema/WorkOrder';

export default class RepairEstimator extends LightningElement {
    // Filter we build based on Record Type and user input for selecting a Work Order
    workOrderFilter = {
        criteria: [
            {
                fieldPath: 'RecordTypeId',
                operator: 'eq',
                value: this.recordTypeId || '',
            }
        ],
        filterLogic: '1',
    };

    workdOrderMatchingInfo = {
        primaryField: { fieldPath: 'Description' },
        additionalFields: [{ fieldPath: 'Location.Name' }]
    };

    workOrderDisplayInfo = {
        primaryField: { fieldPath: 'Name' },
        additionalFields: [{ fieldPath: 'Location.Name' }, { fieldPath: 'Description' }]
    };

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
}