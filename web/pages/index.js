import Head from "next/head"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import styles from "../styles/Home.module.css"
import Web3Modal from "web3modal"
import { providers, Contract } from "ethers"
import { WHITELIST_ADDRESS, ABI } from "../constants"

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [numOfWhitelisted, setNumOfWhitelisted] = useState(0)
  const [joinedWhitelist, setJoinedWhitelist] = useState(false)
  const [loading, setLoading] = useState(false)
  const Web3ModalRef = useRef()

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await Web3ModalRef.current.connect()
      const web3Provider = new providers.Web3Provider(provider)
      const { chainId } = await web3Provider.getNetwork()
      // console.log(chainId)
      if (chainId !== 80001) {
        window.alert("Change to Mumbai network")
        throw new Error("Change to Mumbai network")
      }
      if (needSigner) {
        const signer = web3Provider.getSigner()
        return signer
      }
      return web3Provider
    } catch (error) {
      console.error(error)
    }
  }

  const checkIfAddressIsWhitelisted = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const whitelistContract = new Contract(WHITELIST_ADDRESS, ABI, signer)
      const address = await signer.getAddress()
      // console.log(address)
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      )
      setJoinedWhitelist(_joinedWhitelist)
    } catch (error) {
      console.error(error)
    }
  }

  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner()
      const whitelistContract = new Contract(WHITELIST_ADDRESS, ABI, provider)
      const _numOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted()
      console.log(_numOfWhitelisted)
      setNumOfWhitelisted(_numOfWhitelisted.toString())
    } catch (error) {
      console.error(error)
    }
  }

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const whitelistContract = new Contract(WHITELIST_ADDRESS, ABI, signer)

      const tx = await whitelistContract.addAddressToWhitelist()
      setLoading(true)
      await tx.wait()
      setLoading(false)
      await getNumberOfWhitelisted()
      setJoinedWhitelist(true)
    } catch (error) {
      console.error(error)
    }
  }

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            You are already in the whitelist.
          </div>
        )
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join wailist!
          </button>
        )
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      )
    }
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner()
      setWalletConnected(true)
      checkIfAddressIsWhitelisted()
      getNumberOfWhitelisted()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      Web3ModalRef.current = new Web3Modal({
        network: "maticmum",
        providerOptions: {},
        disableInjectedProvider: false,
      })
      connectWallet()
    }
  }, [walletConnected])

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-DApp" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to CryptoDevs!</h1>
          <div className={styles.description}>
            NFT collection for developers yay!
          </div>
          <div className={styles.description}>
            {numOfWhitelisted} have joined the whitelist!
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" alt="" />
        </div>
      </div>
      <footer className={styles.footer}>Made with &#10084; by Ari xD</footer>
    </div>
  )
}
