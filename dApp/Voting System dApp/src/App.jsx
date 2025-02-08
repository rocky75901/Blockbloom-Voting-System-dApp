import { useState, useEffect } from "react";
import './App.css';
import { Contract, BrowserProvider } from "ethers";
import { abi, contractAddress } from "./Voting.json";

function App() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [output, setOutput] = useState("");
  const [votingActive, setVotingActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const provider = new BrowserProvider(window.ethereum);

  const connectMetamask = async () => {
    const signer = await provider.getSigner();
    alert(`Connected to Metamask with address: ${signer.address}`);
  };

  const fetchCandidates = async () => {
    const signer = await provider.getSigner();
    const instance = new Contract(contractAddress, abi, signer);
    const candidateList = await instance.getCandidates();
    setCandidates(candidateList);
  };

  const checkAdmin = async () => {
    const signer = await provider.getSigner();
    const instance = new Contract(contractAddress, abi, signer);
    const address = await signer.getAddress();
    const adminStatus = await instance.isAdmin(address);
    setIsAdmin(adminStatus);
  };

  const checkVotingStatus = async () => {
    const signer = await provider.getSigner();
    const instance = new Contract(contractAddress, abi, signer);
    const status = await instance.votingActive();
    setVotingActive(status);
  };

  const castVote = async () => {
    if (!selectedCandidate) {
      alert("Please select a candidate!");
      return;
    }
    const signer = await provider.getSigner();
    const instance = new Contract(contractAddress, abi, signer);
    const trx = await instance.castVote(selectedCandidate);
    alert(`Vote cast successfully. Transaction Hash: ${trx.hash}`);
  };

  const getVotes = async (candidate) => {
    const signer = await provider.getSigner();
    const instance = new Contract(contractAddress, abi, signer);
    const voteCount = await instance.getVotes(candidate);
    setOutput(`Votes for ${candidate}: ${voteCount}`);
  };

  const startVoting = async () => {
    const signer = await provider.getSigner();
    const instance = new Contract(contractAddress, abi, signer);
    await instance.startVoting();
    alert("Voting started.");
    setVotingActive(true);
  };

  const stopVoting = async () => {
    const signer = await provider.getSigner();
    const instance = new Contract(contractAddress, abi, signer);
    await instance.stopVoting();
    alert("Voting stopped.");
    setVotingActive(false);
  };

  const resetVotes = async () => {
    const signer = await provider.getSigner();
    const instance = new Contract(contractAddress, abi, signer);
    await instance.resetVotes();
    alert("Votes have been reset.");
  };

  useEffect(() => {
    fetchCandidates();
    checkAdmin();
    checkVotingStatus();
  }, []);

  return (
    <div>
      <h1>Voting dApp</h1>
      <button onClick={connectMetamask}>Connect to Metamask</button>
      <h2>Voting Status: {votingActive ? "Active" : "Inactive"}</h2>
      {isAdmin && (
        <div>
          <button onClick={startVoting} disabled={votingActive}>
            Start Voting
          </button>
          <button onClick={stopVoting} disabled={!votingActive}>
            Stop Voting
          </button>
          <button onClick={resetVotes}>Reset Votes</button>
        </div>
      )}
      <div>
        <h2>Candidates</h2>
        {candidates.length === 0 ? (
          <p>Loading candidates...</p>
        ) : (
          candidates.map((candidate, index) => (
            <div key={index}>
              <p>{candidate}</p>
              <button onClick={() => getVotes(candidate)}>Get Votes</button>
            </div>
          ))
        )}
      </div>
      {votingActive && (
        <div>
          <h3>Cast Your Vote</h3>
          <select
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
          >
            <option value="">Select a Candidate</option>
            {candidates.map((candidate, index) => (
              <option key={index} value={candidate}>
                {candidate}
              </option>
            ))}
          </select>
          <button onClick={castVote}>Vote</button>
        </div>
      )}
      <div>
        <h3>Output</h3>
        <p>{output}</p>
      </div>
    </div>
  );
}

export default App;
