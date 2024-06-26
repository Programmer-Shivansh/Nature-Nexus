import StellarSdk from "@stellar/stellar-sdk"



    var server = new StellarSdk.Horizon.Server(
        "https://horizon-testnet.stellar.org",
        );
        var sourceKeys = StellarSdk.Keypair.fromSecret(
            "SDOI2IUTWLVN3P2FO3YKN572N4SZMLZV7JKIH5IGH2KHOU4CEMLUSGNV",
            );
            var destinationId = "GALONDBAKAKRRMXZLQ6VKQOYDE6GJI4D5XE5RKFNAK2AD3DEL7XCOXSO";
            // var destinationId = "GAYEHFRCF7PROLJGZT4SP2DEHRZLUPYFPSEB3CBGZOTZO3LA3VNHYOF5";
            // Transaction will hold a built transaction we can resubmit if the result is unknown.
            var transaction;
            
            // First, check to make sure that the destination account exists.
            // You could skip this, but if the account does not exist, you will be charged
            // the transaction fee when the transaction fails.
            server
            .loadAccount(destinationId)
            // If the account is not found, surface a nicer error message for logging.
            .catch(function (error) {
                if (error instanceof StellarSdk.NotFoundError) {
                    throw new Error("The destination account does not exist!");
                } else return error;
            })
            // If there was no error, load up-to-date information on your account.
            .then(function () {
                return server.loadAccount(sourceKeys.publicKey());
            })
            .then(function (sourceAccount) {
                // Start building the transaction.
                transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
                    fee: StellarSdk.BASE_FEE,
                    networkPassphrase: StellarSdk.Networks.TESTNET,
                })
                .addOperation(
                    StellarSdk.Operation.payment({
                        destination: destinationId,
                        // Because Stellar allows transaction in many currencies, you must
                        // specify the asset type. The special "native" asset represents Lumens.
                        asset: StellarSdk.Asset.native(),
                        amount: amount,
                    }),
                    )
                    // A memo allows you to add your own metadata to a transaction. It's
                    // optional and does not affect how Stellar treats the transaction.
                    .addMemo(StellarSdk.Memo.text("Test Transaction"))
                    // Wait a maximum of three minutes for the transaction
                    .setTimeout(180)
                    .build();
                    // Sign the transaction to prove you are actually the person sending it.
                    transaction.sign(sourceKeys);
                    // And finally, send it off to Stellar!
                    return server.submitTransaction(transaction);
                })
                .then(function (result) {
                    console.log("Success! Results:", result);
                })
                .catch(function (error) {
                    console.error("Something went wrong!", error);
                    // If the result is unknown (no response body, timeout etc.) we simply resubmit
                    // already built transaction:
                    // server.submitTransaction(transaction);
                });

// checking(10)