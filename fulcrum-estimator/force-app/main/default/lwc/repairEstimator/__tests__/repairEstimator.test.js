import { createElement } from 'lwc';
import RepairEstimator from 'c/repairEstimator';

describe('c-repair-estimator', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('Renders correctly, with buttons disabled, in default state', () => {
        const element = createElement('c-repair-estimator', {
            is: RepairEstimator
        });

        document.body.appendChild(element);

        return Promise.resolve().then(() => {
            const saveButton = element.shadowRoot.querySelector('lightning-button[title="Save Estimate"]');
            const createButton = element.shadowRoot.querySelector('lightning-button[title="Create Estimate"]');
            expect(saveButton.disabled).toBe(true);
            expect(createButton.disabled).toBe(true);
        });
    });

    it('Renders correctly, with save disabled, but create enabled, when record has been picked', () => {
        const element = createElement('c-repair-estimator', {
            is: RepairEstimator
        });

        document.body.appendChild(element);

        const recordPicker = element.shadowRoot.querySelector('lightning-record-picker');

        recordPicker.recordId = '1234';
        recordPicker.dispatchEvent(new CustomEvent('change', {
            detail: {
                recordId: '1234'
            }
        }));

        return Promise.resolve().then(() => {
            const saveButton = element.shadowRoot.querySelector('lightning-button[title="Save Estimate"]');
            const createButton = element.shadowRoot.querySelector('lightning-button[title="Create Estimate"]');
            expect(saveButton.disabled).toBe(true);
            expect(createButton.disabled).toBe(false);
        });
    });
});