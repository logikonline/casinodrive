# casinodrive-dapp

CasinoDrive employs the following methods to help elevate attacks although much more work needs to be done before it is hardened imo.

## Avoiding Common Attacks

1. Logic Bugs : Initial passes to confirm process flow have been done in unit testing.  100% test coverage of all routines is needed though.  A method of ensuring the driver is not paid before the passenger arrives is slated for the next version via a rating/confirm payment routine.

2. Failed Sends : Ether is only transfered in the EthWallet contract.  Employing the transfer method, in the event of a fail - the transacrtion is reverted.  Future enhancement will log the passengers wallets in another mapping accessible only by the owner incase of orhpan operations.

3. Re-entry : The use of enumerated Pending and PendingCancel states were used to prevent re-entry attacks.

4. Integer Arithmetic Overflow : Contract uses uint32 as a base type with the index list, no other routines are exposed to overflow and addresses are used for identifying records.

5. Poison Data : The Passenger can inject different prices and time which needs to be addressed to ensure fees or future bad ratings are not used to attack the driver.  Otherwise the Passenger is insulated from the driver except for logic bug described in 1.

6. Exposed functions : Functions have fail-safe checks to ensure a passenger or a driver is accessing the routines designed for them.

7. Exposed Secrets - There are no secrets to keep.

8. Denial of Service/Dust Spam : This was mitigated by limiting calls to only valid users.  Otherwise it reverts calls.

9. Miner Vulnerabilities : Short term block timestamp is irrelevant to the application and future Oracle call for time will be used only for cancelled requests to imburse the driver/passenger if canceled.

10. Malicious Creator : Contract does not handle funds directly, the passenger does via the EthWallet kept seperate.

11. Off Chain Safety : Currently the contract does not rely on any external services to perform any actions.  Future will be only time calls for cancelation.

12. Cross-chain Replay Attacks : Is Valid but since the driver/passenger handshake must happen, it should be mitigaged.

13. Tx.Origin Problem : no use of Tx.origin.

14. Solidity Function Signatures and Fallback Data Collisions : Revert statments are used to mitigate the risk.

15. Incorrect use of Cryptography : No use of cryptography in contracts.

16. Gas Limits : This is presewntly my largest threat.  I am working to use memory arrays where possible.  Also the Pausable modifier is using too much gas so I am working to reduce this.

17. Stack Depth Exhaustion : Since the EthWallet uses .transfer and is buried in routines that keep track of state, the depth should not occur and revert if attempted.
