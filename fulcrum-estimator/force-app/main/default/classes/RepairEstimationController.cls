public with sharing class RepairEstimationController {
    @AuraEnabled
    public static void saveRepairEstimateLineItems(String jsonLineItems) {
        if (String.isNotBlank(jsonLineItems)) {
            try {
                List<Repair_Estimate_Line_Item__c> lineItems = 
                    (List<Repair_Estimate_Line_Item__c>) JSON.deserialize(jsonLineItems, List<Repair_Estimate_Line_Item__c>.class);
                
                upsert lineItems;
            } catch (DmlException e) {
                // Handle DML exceptions
                throw new AuraHandledException('Error saving repair estimates: ' + e.getMessage());
            } catch (Exception e) {
                // Handle other exceptions
                throw new AuraHandledException('Error processing request: ' + e.getMessage());
            }
        } else {
            throw new AuraHandledException('No line items to save.');
        }
    }
}