import { LightningElement, api } from 'lwc';

export default class RepairLineItem extends LightningElement {
    @api name = '';
    @api type = 'Materials';
    @api price = '';
    @api notes = '';
    @api lineItemId = '';

    @api allDisabled = false;
    @api saveAndDeleteDisabled = false;

    // Hard-coded picklist for Type of Line Item
    // This could be pulled from our existing picklist. Hard-coded to save time.
    // Value of each option matches our picklist API values for easy saving.
    get typeOptions() {
        return [
            { label: 'Materials', value: 'Materials' },
            { label: 'Labor', value: 'Labor' },
            { label: 'All-Inclusive', value: 'All-Inclusive' },
        ];
    }
    
    // Since our change handlers are similar in structure, we can condense them in to a generic handler using the name of the field
    // We bubble the changes up to the main component to ensure the data is consistent and housed at the top level
    handleGenericChange(e) {
        this.dispatchEvent(new CustomEvent('changeitemvalues', {
            detail: {
                fieldName: e.target.name,
                value: e.detail.value,
                id: this.lineItemId
            },
            bubbles: true,
            composed: true
        }));
    }

    handleDelete(e) {
        this.dispatchEvent(new CustomEvent('deleteitem', {
            detail: {
                id: this.lineItemId
            },
            bubbles: true,
            composed: true
        }))
    }
}