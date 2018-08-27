# casinodrive-dapp

  This initially is just to confirm my understanding of ethereum and not be the end solution.  The solution users would use to consume both the driver and passenger interface would be entirely native mobile app not web.  Therefor my emphasis has been on understanding the solidity aspect and not focusing on the web although I understand the grading requirements, it was not a focus and feature creep got the best of me.

# Development Decisions

1. To understand the workings of the solidity and coding to a blockchain.
2. Implement my own library, touch on as many aspects around using the language.
3. I tried the uPort for a prototype but the trufflebox / registration of my identity in appmanager had an issue for demo

# Design Pattern Decisions

1. Ownerable/Pausable : Added to allow for a stop gap in execiution of the contracts
2. EthWallet : Designed this way to prevent a single contraxt from holding all tokens and being attacked.  This method prevents commingling of funds and any multiples (or additional stops, tips, etc) will be stored in this trip wallet.  It also allows for easy fines to be applied and not draining the main pool.  In future, the CasinoDrive contract may hold fees that are imposed.
3. Mapped Structs/Index : Inside the CasinoDrive, I elected to employ a Mapped Struct and Index pattern to allow me random access by either unique Id or row number.  This ensured unique Ids enclosed within a record which I could count and enumerate the Ids.  It also allowed me to control the size of the list and delete from it.
4. Members Library : I elected to pull out the structure and enumerations into a library for future flexibility.

