public with sharing class AccountContactController {

    // Get all Accounts for dropdown
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [SELECT Id, Name FROM Account ORDER BY Name];
    }

    // Get Contacts by Account Id
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactsByAccount(Id accountId) {
        return [
            SELECT Id, FirstName, LastName, Email, Phone, Title
            FROM Contact
            WHERE AccountId = :accountId
            ORDER BY LastName, FirstName
        ];
    }

    // Update Contacts
    @AuraEnabled
    public static void updateContacts(List<Contact> contacts) {
        try {
            update contacts;
        } catch(Exception e) {
            throw new AuraHandledException('Error updating contacts: ' + e.getMessage());
        }
    }

    // Delete Contacts
    @AuraEnabled
    public static void deleteContacts(List<Id> contactIds) {
        try {
            List<Contact> contactsToDelete = [SELECT Id FROM Contact WHERE Id IN :contactIds];
            delete contactsToDelete;
        } catch(Exception e) {
            throw new AuraHandledException('Error deleting contacts: ' + e.getMessage());
        }
    }
}
