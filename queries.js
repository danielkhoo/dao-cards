export const GOVERNANCE_QUERY = `
{
  governanceFrameworks{
    name
    contractAddress
    tokenAddress
  }
  governances {
    id
    currentTokenHolders
    totalTokenHolders
    currentDelegates
    totalDelegates
    delegatedVotesRaw
    delegatedVotes
    proposals
    proposalsQueued
    proposalsExecuted
    proposalsCanceled
  }
  delegates(first: 3, orderBy: delegatedVotes, orderDirection: desc) {
	  id
    delegatedVotes
    tokenHoldersRepresentedAmount
  }
  proposals(first: 1, orderBy: creationBlock, orderDirection: desc) {
    id
    proposer {
      id
    }
    description
    state
     totalDelegateVotes
    totalWeightedVotes
    forDelegateVotes
    forWeightedVotes
    againstDelegateVotes
    againstWeightedVotes
    abstainDelegateVotes
    abstainWeightedVotes
    governanceFramework {
      id
      name
      type
    }
  }
}
`