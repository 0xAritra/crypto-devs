import Head from "next/head"
import { useEffect, useRef, useState } from "react"
import styles from "../styles/Home.module.css"
import Web3Modal from "web3modal"
import { providers, Contract, utils } from "ethers"
import { NFT_CONTRACT_ADDRESS, ABI } from "../constants"

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [presaleStarted, setPresaleStarted] = useState(false)
  const [presaleEnded, setPresaleEnded] = useState(false)
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0")

  const Web3ModalRef = useRef()

  const presaleMint = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, signer)
      const tx = await nftContract.presaleMint({
        value: utils.parseEther("0.001"),
      })
      setLoading(true)
      await tx.wait()
      setLoading(false)
      window.alert("You minted an CryptoDevs NFT!")
    } catch (error) {
      console.error(error)
    }
  }

  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, signer)
      const tx = await nftContract.mint({
        value: utils.parseEther("0.001"),
      })
      setLoading(true)
      await tx.wait()
      setLoading(false)
      window.alert("You minted an CryptoDevs NFT!")
    } catch (error) {
      console.error(error)
    }
  }

  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, signer)
      const tx = await nftContract.startPresale()
      setLoading(true)
      await tx.wait()
      setLoading(false)
      await checkIfPresaleStarted()
    } catch (error) {
      console.error(error)
    }
  }

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner()
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, provider)
      const _presaleStarted = await nftContract.presaleStarted()
      if (!_presaleStarted) {
        await getOwner()
      }
      setPresaleStarted(_presaleStarted)
      return _presaleStarted
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner()
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, provider)
      const _presaleEnded = await nftContract.presaleEnded()
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000))
      if (hasEnded) {
        setPresaleEnded(true)
      } else {
        setPresaleEnded(false)
      }
      return hasEnded
    } catch (error) {
      console.error(error)
      setPresaleEnded(false)
    }
  }

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner()
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, provider)
      const _owner = await nftContract.owner()
      const signer = provider.getSigner()
      const address = await signer.getAddress()
      if (_owner.toLowerCase() === address.toLowerCase()) {
        setIsOwner(true)
      } else setIsOwner(false)
    } catch (error) {
      console.error(error)
    }
  }

  const getTokenIdsMinted = async () => {
    try {
      const provider = await getProviderOrSigner()
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, ABI, provider)
      const _tokenIds = await nftContract.tokenIds()
      setTokenIdsMinted(_tokenIds.toString())
    } catch (error) {
      console.error(error)
    }
  }

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

  const connectWallet = async () => {
    try {
      await getProviderOrSigner()
      setWalletConnected(true)
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

      const _presaleStarted = checkIfPresaleStarted()
      if (_presaleStarted) {
        checkIfPresaleEnded()
      }

      getTokenIdsMinted()

      const presaleEndedInterval = setInterval(async () => {
        const _presaleStarted = await checkIfPresaleStarted()
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded()
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval)
          }
        }
      }, 5 * 1000)

      setInterval(async () => {
        await getTokenIdsMinted()
      }, 5 * 1000)
    }
  }, [walletConnected])

  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button className={styles.button} onClick={connectWallet}>
          Connect Wallet
        </button>
      )
    }

    if (loading) return <button className={styles.button}>Loading...</button>

    if (isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale...
        </button>
      )
    }

    if (!presaleStarted) {
      return <div className={styles.description}>Presale hasn't started!</div>
    }

    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale Started! Mint if you are in the whitelist.
          </div>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      )
    }

    if (presaleStarted && presaleEnded) {
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      )
    }
  }

  return (
    <div>
      <Head>
        <title>NFT Dapp</title>
        <meta name="description" content="NFT-DApp" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to CryptoDevs!</h1>
          <div className={styles.description}>
            NFT collection for developers yay!
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 NFTs have been minted!
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" alt="" />
        </div>
      </div>
      <footer className={styles.footer}>Made with &#10084; by Ari xD</footer>
    </div>
  )
}
