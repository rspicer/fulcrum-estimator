public with sharing class RepairEstimationController {
    // Method for saving our Repair Estimates, in bulk
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

    // This method is only here for the purposes of our demo, to make setup easy. I recognize that this kind of thing would never really go in a controller.
    public static void createEstimationData() {
        //Schema.Location must be used since System.Location is pulled by default if you just type "Location"
        List<Schema.Location> locations = new List<Schema.Location>();

        Schema.Location loc1 = new Schema.Location(
            Name='ACME Incorporated',
            LocationType='Warehouse',
            Description='Warehouse. For things that go boom.'
        );

        Schema.Location loc2 = new Schema.Location(
            Name='Stark Towers',
            LocationType='Site',
            Description='Avengers HQ'
        );

        locations.add(loc1);
        locations.add(loc2);

        insert locations;

        List<WorkOrder> workOrders = new List<WorkOrder>();

        WorkOrder wo1 = new WorkOrder(
            Status='New',
            Priority='High',
            LocationId=loc1.Id,
            Subject='Coyote-shaped hole in the wall',
            Description='Again?!'
        );

        WorkOrder wo2 = new WorkOrder(
            Status='New',
            Priority='High',
            LocationId=loc2.Id,
            Subject='Loki-shaped dent in the floor',
            Description='Hulk Smash'
        );

        workOrders.add(wo1);
        workOrders.add(wo2);

        insert workOrders;
    }
}