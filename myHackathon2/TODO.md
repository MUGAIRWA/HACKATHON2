# Donor Dashboard Enhancement - Add Funds & Fund Meal Implementation

## Tasks to Complete

### 1. Database Schema Update
- [x] Add `balance` field to profiles table (decimal/float type)
- [x] Update Profile interface in supabase.ts to include balance field

### 2. Supabase Helpers Update
- [x] Add getDonorBalance helper function
- [x] Add updateDonorBalance helper function
- [x] Add createAddFundsTransaction helper function

### 3. Paystack Integration Enhancement
- [x] Create addFundsPayment function in paystack.ts
- [x] Handle add funds payment success callback
- [x] Update payment metadata to distinguish add funds vs meal funding

### 4. DonorDashboard.tsx Updates
- [x] Add donor balance state management
- [x] Create handleAddFunds function
- [x] Wire up "Add Funds to Your Account" button
- [x] Update ImpactSummary to display current balance
- [x] Ensure handleFund (fund meal) works properly

### 5. Testing
- [ ] Test add funds functionality
- [ ] Test fund meal request functionality
- [ ] Verify balance updates correctly
- [ ] Test payment flows end-to-end

## Current Status
- Implementation complete
- All core functionality implemented
- Ready for testing
