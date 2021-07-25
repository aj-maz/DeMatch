import React, { useEffect, useState } from "react";
import SimpleTournamentsContract from "../contracts/SimpleTournaments.json";
import DeMatchContract from "../contracts/DeMatch.json";

const TournamentAddress = "0x0Aea5F21b5181c26cC013eD827E65aCe0b2Fd87f";

const Match = ({ contractAddress, back, web3 }) => {
  const [reloads, setReloads] = useState(0);
  const [accounts, setAccounts] = useState(null);
  const [match, setMatch] = useState({ loading: true, content: null });

  console.log(contractAddress);
  useEffect(() => {
    const runImm = async () => {
      const acc = await web3.eth.getAccounts();
      setAccounts(acc);
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const dematch = new web3.eth.Contract(
        DeMatchContract.abi,
        contractAddress.address
      );

      console.log(dematch);

      const player1 = await dematch.methods.player1().call();
      const player2 = await dematch.methods.player2().call();
      const meta = await dematch.methods.meta().call();
      const winner = await dematch.methods.winner().call();
      const announcer = await dematch.methods.announcer().call();
      const status = await dematch.methods.status().call();

      setMatch({
        loading: false,
        content: {
          player1,
          player2,
          meta,
          winner,
          announcer,
          status,
        },
      });
    };

    runImm();
  }, [reloads]);

  if (match.loading)
    return (
      <div>
        <button onClick={back}>Back</button>
        <div>Loading Match Deta</div>
      </div>
    );

  const matchData = match.content;

  console.log(matchData);

  /*
  Initial,
        Announced,
        Protested,
        Disputed,
        Resolved */

  const renderStatus = (status) => {
    switch (status) {
      case "0":
        return "Initial";
      case "1":
        return "Announced";
      case "2":
        return "Protested";
      case "3":
        return "Disputed";
      case "4":
        return "Resolved";
    }
  };

  return (
    <div>
      <button onClick={back}>Back</button>
      <div>Match Address: {contractAddress.address}</div>
      <div>Match Title: {matchData.meta}</div>
      <div>Player 1: {matchData.player1}</div>
      <div>Player 2: {matchData.player2}</div>
      <div>Match Status: {renderStatus(matchData.status)}</div>
      {matchData.winner != "0" && (
        <div>
          Current Winner:{" "}
          {matchData.winner == "1" ? matchData.player1 : matchData.player2}
        </div>
      )}
      {matchData.status == "0" &&
        (accounts[0] == matchData.player1 ||
          accounts[0] == matchData.player2) && (
          <button
            onClick={() => {
              const dematch = new web3.eth.Contract(
                DeMatchContract.abi,
                contractAddress.address
              );

              dematch.methods
                .announceWinner("1")
                .send({ from: accounts[0] })
                .then((data) => {
                  console.log(data);
                  setReloads(reloads + 1);
                })
                .catch((err) => {
                  console.log(err);
                  setReloads(reloads + 1);
                });
            }}
          >
            Player 1 Won
          </button>
        )}
      {matchData.status == "0" &&
        (accounts[0] == matchData.player1 ||
          accounts[0] == matchData.player2) && (
          <button
            onClick={() => {
              const dematch = new web3.eth.Contract(
                DeMatchContract.abi,
                contractAddress.address
              );

              dematch.methods
                .announceWinner("1")
                .send({ from: accounts[0] })
                .then((data) => {
                  console.log(data);
                  setReloads(reloads + 1);
                })
                .catch((err) => {
                  console.log(err);
                  setReloads(reloads + 1);
                });
            }}
          >
            Player 2 Won
          </button>
        )}
      {matchData.status == "1" &&
        (accounts[0] == matchData.player1 ||
          accounts[0] == matchData.player2) &&
        accounts[0] != matchData.announcer && (
          <button
            onClick={() => {
              const dematch = new web3.eth.Contract(
                DeMatchContract.abi,
                contractAddress.address
              );

              dematch.methods
                .acceptResult()
                .send({ from: accounts[0] })
                .then((data) => {
                  console.log(data);
                  setReloads(reloads + 1);
                })
                .catch((err) => {
                  console.log(err);
                  setReloads(reloads + 1);
                });
            }}
          >
            Accept Result
          </button>
        )}
      {matchData.status == "1" &&
        (accounts[0] == matchData.player1 ||
          accounts[0] == matchData.player2) &&
        accounts[0] != matchData.announcer && (
          <button
            onClick={() => {
              const dematch = new web3.eth.Contract(
                DeMatchContract.abi,
                contractAddress.address
              );

              dematch.methods
                .protestResult()
                .send({ from: accounts[0], value: 1000000000000000 })
                .then((data) => {
                  console.log(data);
                  setReloads(reloads + 1);
                })
                .catch((err) => {
                  console.log(err);
                  setReloads(reloads + 1);
                });
            }}
          >
            Protest Result
          </button>
        )}

      {matchData.status == "1" &&
        (accounts[0] == matchData.player1 ||
          accounts[0] == matchData.player2) &&
        accounts[0] == matchData.announcer && (
          <button
            onClick={() => {
              const dematch = new web3.eth.Contract(
                DeMatchContract.abi,
                contractAddress.address
              );

              dematch.methods
                .finalizeResult()
                .send({ from: accounts[0] })
                .then((data) => {
                  console.log(data);
                  setReloads(reloads + 1);
                })
                .catch((err) => {
                  console.log(err);
                  setReloads(reloads + 1);
                });
            }}
          >
            Finalize Result
          </button>
        )}

      {matchData.status == "2" &&
        (accounts[0] == matchData.player1 ||
          accounts[0] == matchData.player2) &&
        accounts[0] != matchData.announcer && (
          <button
            onClick={() => {
              const dematch = new web3.eth.Contract(
                DeMatchContract.abi,
                contractAddress.address
              );

              dematch.methods
                .revertResult(matchData.winner == "1" ? "2" : "1")
                .send({ from: accounts[0] })
                .then((data) => {
                  console.log(data);
                  setReloads(reloads + 1);
                })
                .catch((err) => {
                  console.log(err);
                  setReloads(reloads + 1);
                });
            }}
          >
            Revert Result
          </button>
        )}

      {matchData.status == "2" &&
        (accounts[0] == matchData.player1 ||
          accounts[0] == matchData.player2) &&
        accounts[0] == matchData.announcer && (
          <button
            onClick={() => {
              const dematch = new web3.eth.Contract(
                DeMatchContract.abi,
                contractAddress.address
              );

              dematch.methods
                .depositArbitrationFeeForAnnouncer()
                .send({ from: accounts[0], value: 1000000000000000 })
                .then((data) => {
                  console.log(data);
                  setReloads(reloads + 1);
                })
                .catch((err) => {
                  console.log(err);
                  setReloads(reloads + 1);
                });
            }}
          >
            Deposit Arbitration Fee
          </button>
        )}

      {(matchData.status == "4" &&
        (matchData.winner = 1 && accounts[0] == matchData.player1)) ||
        (matchData.winner == 2 && accounts[0] == matchData.player2 && (
          <button
            onClick={() => {
              const tS = new web3.eth.Contract(
                SimpleTournamentsContract.abi,
                TournamentAddress
              );
              tS.methods
                .withdrawFunds(contractAddress.id)
                .send({ from: accounts[0] })
                .then((r) => {
                  console.log(r);
                  setReloads(reloads + 1);
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          >
            Withdraw Funds
          </button>
        ))}
    </div>
  );
};

const Main = ({ web3 }) => {
  const [pss, setProposals] = useState({ loading: true, items: [] });
  const [matches, setMatches] = useState({ loading: true, items: [] });
  const [screen, setScreen] = useState("main");
  const [pTitle, setPTitle] = useState("");
  const [pValue, setPValue] = useState("");
  const [accounts, setAccounts] = useState(null);
  const [reloads, setReloads] = useState(0);

  const [selectedProposal, setSelectedProposal] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState(0);

  useEffect(() => {
    const immidiateRun = async () => {
      const acc = await web3.eth.getAccounts();
      setAccounts(acc);

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const tS = new web3.eth.Contract(
        SimpleTournamentsContract.abi,
        TournamentAddress
      );

      console.log(tS);

      const proposals = await tS.methods.getProposals().call();

      setProposals({ loading: false, items: proposals });

      const mts = await tS.methods.getMatches().call();

      setMatches({ loading: false, items: mts });

      console.log(proposals);
    };

    immidiateRun();
  }, [reloads]);

  if (screen == "propose")
    return (
      <div>
        <div className="field">
          <p>Title</p>
          <input
            onChange={(e) => setPTitle(e.target.value)}
            placeholder="proposal title"
          />
        </div>
        <div className="field">
          <p>Propsal Value in Wei</p>
          <input
            onChange={(e) => setPValue(e.target.value)}
            type="number"
            placeholder="value"
          />
        </div>
        <div className="field">
          <button
            onClick={() => {
              const tS = new web3.eth.Contract(
                SimpleTournamentsContract.abi,
                TournamentAddress
              );

              setPValue("");
              setPTitle("");

              tS.methods
                .proposeMatch(pTitle)
                .send({ from: accounts[0], value: pValue })
                .then((r) => {
                  console.log(r);
                  setReloads(reloads + 1);
                  setScreen("main");
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
            disabled={!pTitle || !pValue}
          >
            Create Proposal
          </button>
        </div>
        <div className="field">
          <button
            onClick={() => {
              setScreen("main");
              const tS = new web3.eth.Contract(
                SimpleTournamentsContract.abi,
                TournamentAddress
              );
            }}
          >
            Cancel{" "}
          </button>
        </div>
      </div>
    );

  const formattedProposals =
    pss.items && pss.items.map((ps, index) => ({ ...ps, id: index }));

  const formattedMatches =
    matches.items &&
    matches.items.map((address, index) => ({ address, id: index }));

  if (selectedProposal)
    return (
      <div>
        <div>
          {selectedProposal.title} - {selectedProposal.amount} Wei
        </div>
        <div>Proposer: {selectedProposal.proposer}</div>
        <div>Status: {selectedProposal.open ? "Open" : "Closed"}</div>
        <div>
          {selectedProposal.open &&
          selectedProposal.proposer === accounts[0] ? (
            <button
              onClick={() => {
                const tS = new web3.eth.Contract(
                  SimpleTournamentsContract.abi,
                  TournamentAddress
                );

                tS.methods
                  .endProposal(selectedProposal.id)
                  .send({ from: accounts[0] })
                  .then((r) => {
                    console.log(r);
                    setReloads(reloads + 1);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }}
            >
              End Proposal
            </button>
          ) : (
            <button
              onClick={() => {
                const tS = new web3.eth.Contract(
                  SimpleTournamentsContract.abi,
                  TournamentAddress
                );

                tS.methods
                  .acceptProposal(selectedProposal.id)
                  .send({ from: accounts[0], value: selectedProposal.amount })
                  .then((r) => {
                    console.log(r);
                    setReloads(reloads + 1);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }}
            >
              Accept Proposal
            </button>
          )}
        </div>
        <div>
          <button onClick={() => setSelectedProposal(null)}>Back</button>
        </div>
      </div>
    );

  if (selectedMatch) {
    return (
      <Match
        contractAddress={selectedMatch}
        back={() => setSelectedMatch(null)}
        web3={web3}
      />
    );
  }

  return (
    <div>
      <button onClick={() => setScreen("propose")} className="btn btn-primary">
        Propose Match
      </button>
      <hr />
      {pss.loading ? (
        <div>loading</div>
      ) : (
        <div className="proposals-container">
          <h4>Proposals</h4>
          <ul>
            {formattedProposals
              .filter((item) => item.open)
              .map((item, index) => (
                <li
                  onClick={() =>
                    setSelectedProposal(
                      formattedProposals.find((ps) => ps.id === item.id)
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    {item.title} - {item.amount} Wei
                  </div>
                  <div>Proposer: {item.proposer}</div>
                </li>
              ))}
          </ul>
        </div>
      )}
      {matches.loading ? (
        <div>loading</div>
      ) : (
        <div className="proposals-container">
          <h4>Matches</h4>
          <ul>
            {formattedMatches.map((item, index) => (
              <li
                onClick={() => setSelectedMatch(item)}
                style={{ cursor: "pointer" }}
              >
                <div>Match Address: item</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Main;
