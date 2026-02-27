import {
  signTransaction,
  setAllowed,
  getAddress,
  disconnect,
} from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

const checkConnection = async () => {
  return await setAllowed();
};

const retrievePublicKey = async () => {
  const { address } = await getAddress();
  return address;
};

const getBalance = async () => {
  await setAllowed();
  const { address } = await getAddress();
  const account = await server.loadAccount(address);
  const xlm = account.balances.find((b) => b.asset_type === "native");
  return xlm ? xlm.balance : "0";
};

const userSignTransaction = async (xdr, network, signWith) => {
  return await signTransaction(xdr, {
    network,
    accountToSign: signWith,
  });
};

const sendPayment = async (destination, amount) => {
  await setAllowed();
  const { address } = await getAddress();

  const sourceAccount = await server.loadAccount(address);

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination,
        asset: StellarSdk.Asset.native(),
        amount: amount,
      })
    )
    .setTimeout(180)
    .build();

  const signed = await userSignTransaction(
    tx.toXDR(),
    StellarSdk.Networks.TESTNET,
    address
  );

  if (signed.error) {
    throw new Error(signed.error);
  }

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signed.signedTxXdr,
    StellarSdk.Networks.TESTNET
  );

  const res = await server.submitTransaction(signedTx);
  return res.hash;
};

const disconnectWalletApi = async () => {
  try {
    await disconnect();
  } catch (_) {
  }
};

export {
  checkConnection,
  retrievePublicKey,
  getBalance,
  userSignTransaction,
  sendPayment,
  disconnectWalletApi,
};
