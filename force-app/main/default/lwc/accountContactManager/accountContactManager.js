import { LightningElement, track, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountContactController.getAccounts';
import getContactsByAccount from '@salesforce/apex/AccountContactController.getContactsByAccount';
import updateContacts from '@salesforce/apex/AccountContactController.updateContacts';
import deleteContacts from '@salesforce/apex/AccountContactController.deleteContacts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLUMNS = [
    { label: 'First Name', fieldName: 'FirstName', editable: true },
    { label: 'Last Name', fieldName: 'LastName', editable: true },
    { label: 'Email', fieldName: 'Email', type: 'email', editable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true },
    { label: 'Title', fieldName: 'Title', editable: true }
];

export default class AccountContactManager extends LightningElement {

    @track accountOptions = [];
    @track contacts = [];
    @track selectedAccountId;
    @track selectedRows = [];
    @track draftValues = [];

    columns = COLUMNS;

    @wire(getAccounts)
    wiredAccounts({ data, error }) {
        if (data) {
            this.accountOptions = data.map(acc => ({
                label: acc.Name,
                value: acc.Id
            }));
        }
    }

    handleAccountChange(event) {
        this.selectedAccountId = event.detail.value;
        this.loadContacts();
    }

    loadContacts() {
        if(!this.selectedAccountId) return;

        getContactsByAccount({ accountId: this.selectedAccountId })
            .then(result => {
                this.contacts = result;
            })
            .catch(error => {
                this.showToast('Error', error?.body?.message ?? 'Unknown error', 'error');
            });
    }

    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows;
    }

    // Called when inline edit is saved
    handleSave(event) {
        this.draftValues = event.detail.draftValues;
        this.updateContacts(this.draftValues);
    }

    // Called when Save button is clicked
    handleSaveButton() {
        if (this.draftValues.length === 0) {
            this.showToast('Info', 'No changes to save', 'info');
            return;
        }
        this.updateContacts(this.draftValues);
    }

    updateContacts(updatedFields) {
        updateContacts({ contacts: updatedFields })
            .then(() => {
                updatedFields.forEach(updated => {
                    let index = this.contacts.findIndex(c => c.Id === updated.Id);
                    if(index !== -1){
                        this.contacts[index] = { ...this.contacts[index], ...updated };
                    }
                });
                this.draftValues = [];
                this.showToast('Success', 'Contacts updated successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error', error?.body?.message ?? 'Unknown error', 'error');
            });
    }

    handleDelete() {
        if(this.selectedRows.length === 0){
            this.showToast('Warning', 'Please select at least one contact', 'warning');
            return;
        }

        const contactIds = this.selectedRows.map(row => row.Id);

        deleteContacts({ contactIds })
            .then(() => {
                this.contacts = this.contacts.filter(c => !contactIds.includes(c.Id));
                this.selectedRows = [];
                this.showToast('Success', 'Contacts deleted successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error', error?.body?.message ?? 'Unknown error', 'error');
            });
    }

    showToast(title, message, variant){
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
}
