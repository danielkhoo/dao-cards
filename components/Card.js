import { Badge, Box, Container, Flex, Grid, GridItem, Heading, HStack, Link, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { GOVERNANCE_QUERY } from '../queries';
const { utils, providers } = ethers

const provider = new providers.InfuraProvider('mainnet');
const lookupENSIfExists = async (address, provider) => {
    const proposerENS = await provider.lookupAddress(address)
    return proposerENS ?? address
}
const extractFirstLine = (text) => text.slice(0, text.indexOf("\n"))

const testData = {
    "data": {
        "governanceFrameworks": [
            {
                "name": "ENS Governor",
                "contractAddress": "0x323a76393544d5ecca80cd6ef2a560c6a395b7e3",
                "tokenAddress": "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72"
            }
        ],
        "governances": [
            {
                "id": "OZGovernor",
                "currentTokenHolders": "58459",
                "totalTokenHolders": "172532",
                "currentDelegates": "11628",
                "totalDelegates": "29269",
                "delegatedVotesRaw": "5798921480422457324186398",
                "delegatedVotes": "5798921.480422457324186398",
                "proposals": "9",
                "proposalsQueued": "0",
                "proposalsExecuted": "8",
                "proposalsCanceled": "0"
            }
        ],
        "delegates": [
            {
                "id": "0x81b287c0992b110adeb5903bf7e2d9350c80581a",
                "delegatedVotes": "249571.012691892566163343",
                "tokenHoldersRepresentedAmount": 6555
            },
            {
                "id": "0x983110309620d911731ac0932219af06091b6744",
                "delegatedVotes": "238576.382664598044501555",
                "tokenHoldersRepresentedAmount": 5746
            },
            {
                "id": "0xbdb41bff7e828e2dc2d15eb67257455db818f1dc",
                "delegatedVotes": "221304.532373033505972444",
                "tokenHoldersRepresentedAmount": 2998
            }
        ],
        "proposals": [
            {
                "id": "112764562576314516994943312429834673309292069549953740415731020720942627228986",
                "proposer": {
                    "id": "0xb8c2c29ee19d8307cb7255e1cd9cbde883a267d5"
                },
                "description": "# [EP14][Executable] Funding True Names Ltd\n**Discussion Thread**: [Discuss](https://discuss.ens.domains/t/ep-executable-funding-true-names-ltd/13391)\n\n# Abstract\n\n  True Names Ltd (“TNL”) developed the Ethereum Name Service (“ENS”) protocol, continues to manage the development of the ENS Protocol and solely focuses on this project. Incubated at the Ethereum Foundation in 2017, TNL spun out in 2018 with the charge of designing and deploying THE next generation naming service. TNL is now a growing team of web3 enthusiasts from across the globe working together to support the ENS Ecosystem that now has a passionate community that has registered over 1 million ENS names and uses more than 500 integrations. \n\nIn 2021, TNL initiated the creation of the ENS DAO with the goal of 1) furthering the development of the ENS Protocol and 2) funding public goods projects.\n\n \nIn consideration of the work completed thus far this calendar year and the work in the months and years to come, per Article III of the ENS Constitution, True Names Ltd respectfully requests an evergreen grant stream that will allow the organization to continue the development and improvement of the ENS Protocol. For Calendar Year 2022, this request will amount to $4,197,500 USDC which is equivalent to a daily stream of $11,500 USDC. In Q1 of each year, TNL or the ENS Dao may make requests to alter and/or terminate this evergreen grant stream.\n\n# Specification\nWe request that the ENS DAO approve a daily grant of $11,500 USDC to True Names Ltd, backdated to January 1st, 2022.\n\nThis will be accomplished by approving a dedicated token streaming contract at `0xB1377e4f32e6746444970823D5506F98f5A04201` to spend USDC on behalf of the DAO.\n",
                "state": "EXECUTED",
                "totalDelegateVotes": "287",
                "totalWeightedVotes": "2612620799058028649029618",
                "forDelegateVotes": "281",
                "forWeightedVotes": "2612255125222628564269042",
                "againstDelegateVotes": "6",
                "againstWeightedVotes": "365673835400084760576",
                "abstainDelegateVotes": "0",
                "abstainWeightedVotes": "0",
                "governanceFramework": {
                    "id": "0x323a76393544d5ecca80cd6ef2a560c6a395b7e3",
                    "name": "ENS Governor",
                    "type": "OZGovernor"
                }
            }
        ]

    }
}
const processGovernanceData = async (data) => {
    const governanceFramework = data["governanceFrameworks"][0]
    const governance = data["governances"][0]
    const latestProposal = data["proposals"].length > 0 ? data["proposals"][0] : null

    let latestProposalProposer = ""
    if (latestProposal && latestProposal.proposer) {
        latestProposalProposer = latestProposal.proposer.id
        // latestProposalProposer = await lookupENSIfExists(latestProposal.proposer.id, provider)
    }

    const delegates = await Promise.all(data["delegates"].map(async (d) => {
        // const addressOrENS = await lookupENSIfExists(d.id, provider)
        return {
            // id: addressOrENS, 
            id: d.id,
            delegatedVotes: Math.round(Number(d.delegatedVotes)),
            tokenHoldersRepresentedAmount: Math.round(d.tokenHoldersRepresentedAmount)
        }
    }))

    return {
        title: governanceFramework.name,
        network: "ethereum",
        type: governance.type,
        contractAddress: governanceFramework.contractAddress,
        tokenAddress: governanceFramework.tokenAddress,
        tokenHolders: governance.currentTokenHolders,
        delegates: governance.currentDelegates,
        totalProposals: governance.proposals,
        proposalsQueued: governance.proposalsQueued,
        proposalsExecuted: governance.proposalsExecuted,
        proposalsCanceled: governance.proposalsCanceled,
        latestProposalTitle: latestProposal ? extractFirstLine(latestProposal.description) : "",
        latestProposalState: latestProposal ? latestProposal.state : "",
        latestProposalProposer: latestProposalProposer,
        topDelegates: delegates,
    }
}

export const Card = ({ subgraphName }) => {
    const [cardData, setCardData] = useState();
    useEffect(() => {
        const getData = async () => {
            const response = await fetch(`https://api.thegraph.com/subgraphs/name/${subgraphName}`, {
                "method": "POST",
                "headers": { "content-type": "application/json" },
                "body": JSON.stringify({
                    "operationName": "GetGovernance",
                    "query": GOVERNANCE_QUERY,
                })
            });
            const res = await response.json();
            // const res = testData
            const processed = await processGovernanceData(res.data)
            setCardData(processed)
        }
        getData()
    }, []);

    if (!cardData) return <></>
    return <CardComponent data={cardData} />
}

const CardComponent = ({ data }) => {
    const { title, network, type, contractAddress, tokenAddress, tokenHolders, delegates,
        totalProposals, proposalsQueued, proposalsExecuted, proposalsCanceled,
        latestProposalTitle, latestProposalState, latestProposalProposer, topDelegates } = data
    return <VStack padding={6} borderWidth='1px' borderRadius='lg' display='flex' width={'400px'} fontSize={14}>

        <Flex width={"100%"} alignContent={"center"} justifyContent="space-between">
            <Flex mr={4}>
                <Text fontSize={24} fontWeight={600}>{title}</Text>
            </Flex>
            <Text fontSize={14} fontStyle="italic" textAlign={'end'}>{type} <Badge fontSize={12}>{network}</Badge></Text>

        </Flex>
        <Flex flexDir={'column'} >
            <Item title="Contract" href={`https://etherscan.io/address/${contractAddress}`} value={contractAddress} />
        </Flex>
        <Flex justifyContent={'space-between'} width="100%">
            <Item title="Holders" value={tokenHolders} />
            <Item title="Delegates" value={delegates} />
        </Flex>
        <Flex >
            <Item title="Proposals" value={totalProposals} />
        </Flex>
        <Flex justifyContent={'space-between'} width="100%">
            <Item title="Queued" value={proposalsQueued} />
            <Item title="Canceled" value={proposalsCanceled} />
            <Item title="Executed" value={proposalsExecuted} />
        </Flex>
        <Box pt={4}>
            <Text fontSize={16} fontWeight={600} textAlign="center" >Latest Proposal</Text>
            <Text fontSize={16} fontWeight={500}>{latestProposalTitle}</Text>
            <Box><Badge colorScheme='green' fontSize={12}>{latestProposalState}</Badge></Box>
            <Item title="Proposer" href={`https://etherscan.io/address/${latestProposalProposer}`} value={latestProposalProposer} />
        </Box>
        <Box pt={4} width={'100%'}>
            <Text fontSize={16} fontWeight={600} textAlign="center" >Top Delegates</Text>
            {topDelegates.map((dlgt, idx) => {
                return <Flex fontSize={16} justifyContent={'space-between'} alignItems='center' >
                    <Link href={`https://etherscan.io/address/${dlgt.id}`} isExternal mr={2} overflowWrap={"anywhere"}>{dlgt.id}</Link>
                    <Text>{dlgt.delegatedVotes} votes</Text>
                </Flex>
            })}
        </Box>
    </VStack >
}
const Item = ({ title, value, flexDir = "row", fontSize = 16, href = null }) => {
    return <Flex flexDir={flexDir} fontSize={fontSize}>
        <Text fontWeight={600} mr={1}>{title}: </Text>
        {href ? <Link href={href} isExternal mr={2} overflowWrap={"anywhere"}>{value}</Link>
            : <Text overflowWrap={"anywhere"}>{value}</Text>}

    </Flex>
}