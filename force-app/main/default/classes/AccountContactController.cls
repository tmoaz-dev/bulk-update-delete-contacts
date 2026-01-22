public with sharing class AccountContactController {

    // Get all Accounts
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [
            SELECT Id, Name
            FROM Account
            ORDER BY Name
        ];
    }

    // Get Contacts by Account Id
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactsByAccount(Id accountId) {
        if (accountId == null) {
            return new List<Contact>();
        }

        return [
            SELECT Id, Name, Email, Phone, Title
            FROM Contact
            WHERE AccountId = :accountId
            ORDER BY Name
        ];
    }

    // Update Contacts (Inline Edit)
    @AuraEnabled
    public static void updateContacts(List<Contact> contacts) {
        if (contacts == null || contacts.isEmpty()) return;

        update contacts;
    }

    // Delete Selected Contacts
    @AuraEnabled
    public static void deleteContacts(List<Id> contactIds) {
        if (contactIds == null || contactIds.isEmpty()) return;

        List<Contact> contactsToDelete =
            [SELECT Id FROM Contact WHERE Id IN :contactIds];

        delete contactsToDelete;
    }
}
