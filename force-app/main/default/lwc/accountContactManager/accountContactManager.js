import { LightningElement, track, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountContactController.getAccounts';
import getContactsByAccount from '@salesforce/apex/AccountContactController.getContactsByAccount';
import updateContacts from '@salesforce/apex/AccountContactController.updateContacts';
import deleteContacts from '@salesforce/apex/AccountContactController.deleteContacts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Email', fieldName: 'Email', type: 'email', editable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true },
    { label: 'Title', fieldName: 'Title', editable: true }
];

export default class AccountContactManager extends LightningElement {

    @track accountOptions = [];
    @track contacts;
    @track selectedAccountId;
    @track selectedRows = [];
    @track draftValues = [];

    columns = COLUMNS;

    // Load Accounts
    @wire(getAccounts)
    wiredAccounts({ data, error }) {
        if (data) {
            this.accountOptions = data.map(acc => ({
                label: acc.Name,
                value: acc.Id
            }));
        }
    }

    // Account Change
    handleAccountChange(event) {
        this.selectedAccountId = event.detail.value;
        this.loadContacts();
    }

    // Load Contacts
    loadContacts() {
        getContactsByAccount({ accountId: this.selectedAccountId })
            .then(result => {
                this.contacts = result;
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    // Row Selection
    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows;
    }

    // Save Inline Edits
    handleSave(event) {
        const updatedFields = event.detail.draftValues;

        updateContacts({ contacts: updatedFields })
            .then(() => {
                this.showToast('Success', 'Contacts updated successfully', 'success');
                this.draftValues = [];
                this.loadContacts();
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    // Delete Selected Contacts
    handleDelete() {
        if (this.selectedRows.length === 0) {
            this.showToast('Warning', 'Please select at least one contact', 'warning');
            return;
        }

        const contactIds = this.selectedRows.map(row => row.Id);

        deleteContacts({ contactIds })
            .then(() => {
                this.showToast('Success', 'Contacts deleted successfully', 'success');
                this.selectedRows = [];
                this.loadContacts();
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
}
