import React, { useState } from "react";
import { checkConnection, retrievePublicKey, getBalance, sendPayment } from "./Freighter";

const Header = () => {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [balance, setBalance] = useState("0");
  const [dest, setDest] = useState("");
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState("");

  const connectWallet = async () => {
    try {
      const allowed = await checkConnection();
      if (!allowed) return alert("Permission denied");
      const key = await retrievePublicKey();
      const bal = await getBalance();
      setPublicKey(key);
      setBalance(Number(bal).toFixed(2));
      setConnected(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!dest || !amount) {
    return setTxStatus("Please enter destination and amount.");
  }
    try {
      setTxStatus("Sending...");
      const hash = await sendPayment(dest, amount);
      setTxStatus("Success: " + hash);
      const bal = await getBalance();
      setBalance(Number(bal).toFixed(2));
      setDest("");
      setAmount("");
    } catch (e) {
      console.error(e);
      setTxStatus("Error: " + e.message);
    }
  };

  return (
    <div>
      <div>Stellar dApp</div>
      <div>
        {publicKey && (
          <>
            <div>{`${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`}</div>
            <div>Balance: {balance} XLM</div>
          </>
        )}
        <button onClick={connectWallet} disabled={connected}>
          {connected ? "Connected" : "Connect Wallet"}
        </button>
      </div>

      {connected && (
        <form onSubmit={handleSend}>
          <input
            placeholder="Destination address"
            value={dest}
            onChange={(e) => setDest(e.target.value)}
          />
          <input
            placeholder="Amount (XLM)"
            type="number"
            step="0.0000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button type="submit">Send XLM</button>
          <div>{txStatus}</div>
        </form>
      )}
    </div>
  );
};

export default Header;
