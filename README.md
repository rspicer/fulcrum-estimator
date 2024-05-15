# Fulcrum Test - Repair Estimator

Hi there! Spent a decent amount of time on this, and I think it turned out great. Let me give you some steps for how to set it up. I'll go over features in detail during our call, including things that could have been improved.

## Getting Started

- Clone repo to a folder
- Create a scratch org - NOTE: This project will probably only work in a non-namespaced org. Not for any major reason, but just because I hardcoded field names. Scratch org will work best.
- Push source
- Assign yourself the "Repair Estimator" Permission Set - NOTE: I took a carte blanche approach to permissions. I didn't pay much attention to them - this would not be how I would do a real project, but I don't think I'm being tested on that, so I just made it easy.
- Use the Developer Console, and execute anonymous apex: RepairEstimationController.createEstimationData();
    - This will create some test data
- Navigate to the "Repair Estimator" Tab, and interact as you see fit.
