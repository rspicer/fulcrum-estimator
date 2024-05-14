@isTest
public class Test_RepairEstimationController {
    @isTest
    static void testSaveRepairEstimateLineItemsSuccess() {
        WorkOrder wo = new WorkOrder(Status = 'New', Priority='Low', Subject='Test WO', Description='Test 123');

        insert wo;

        // Create test data
        String jsonLineItems = '[{"Description__c":"Test 1","Type__c":"Materials","Price__c":"150","Notes__c":"Test Notes 1","Repair_Work_Order__c":"' + wo.Id + '"},{"Description__c":"Test 2","Type__c":"Labor","Price__c":"100","Notes__c":"Test Notes 2","Repair_Work_Order__c":"' + wo.Id + '"}]';
        
        Test.startTest();
        RepairEstimationController.saveRepairEstimateLineItems(jsonLineItems);
        Test.stopTest();
        
        // Verify results
        List<Repair_Estimate_Line_Item__c> results = [SELECT Name, Price__c, Description__c, Notes__c, Type__c FROM Repair_Estimate_Line_Item__c];
        System.assertEquals(2, results.size(), 'There should be 2 Repair_Estimate_Line_Item__c records upserted.');
        System.assertEquals('Test 1', results[0].Description__c);
        System.assertEquals(150, results[0].Price__c);
        System.assertEquals('Materials', results[0].Type__c);
        System.assertEquals('Test Notes 1', results[0].Notes__c);
        System.assertEquals('Test 2', results[1].Description__c);
        System.assertEquals(100, results[1].Price__c);
        System.assertEquals('Labor', results[1].Type__c);
        System.assertEquals('Test Notes 2', results[1].Notes__c);
    }

    @isTest
    static void testSaveRepairEstimateLineItemsWithDmlException() {
        // Invalid JSON
        String jsonLineItems = 'Invalid JSON';
        
        try {
            Test.startTest();
            RepairEstimationController.saveRepairEstimateLineItems(jsonLineItems);
            Test.stopTest();
            System.assert(false, 'Exception should have been thrown for DML error.');
        } catch (AuraHandledException e) {
            System.assertEquals('Script-thrown exception', e.getMessage(), 'Exception should be a script-thrown exception, because JSON parsing failed.');
        }
    }
}