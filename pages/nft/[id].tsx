import {
  useAddress,
  useDisconnect,
  useMetamask,
  useContract,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react";
import { GetServerSideProps } from "next";
import { sanityClient, urlFor } from "../../sanity";
import { Collection } from "../../typings";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BigNumber } from "ethers";
import toast, { Toaster } from "react-hot-toast";

interface Props {
  collection: Collection;
}

function NFTDropPage({ collection }: Props) {
  const [claimedSupply, setClaimedSupply] = useState<BigNumber>();
  const [totalSupply, setTotalSupply] = useState<BigNumber>();
  const [loading, setLoading] = useState<boolean>(true);
  const { contract: nftDrop } = useContract(collection.address);

  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();

  const { data: maxSupply, isLoading } = useContractRead(
    nftDrop,
    "getMaxSupply"
  );

  const { data: claimed } = useContractRead(nftDrop, "getTokenId");

  const { mutateAsync, isLoading: minting } = useContractWrite(
    nftDrop,
    "mintNft"
  );

  useEffect(() => {
    if (!nftDrop) return;
    const fetchNFTDropData = () => {
      setLoading(true);
      setClaimedSupply(claimed);
      setTotalSupply(maxSupply);
      setLoading(false);
    };
    fetchNFTDropData();
  }, [nftDrop, maxSupply, claimed]);

  const mintNft = () => {
    setLoading(true);
    const notification = toast.loading("Minting NFT...", {
      style: {
        background: "white",
        color: "green",
        fontWeight: "bolder",
        fontSize: "17px",
        padding: "20px",
      },
    });
    if (!nftDrop || !address) return;
    mutateAsync({ args: [] })
      .then((tx) => {
        console.log(tx);

        toast.success("Congratulations! You successfully minted an NFT", {
          duration: 8000,
          style: {
            background: "green",
            color: "white",
            fontWeight: "bolder",
            fontSize: "17px",
            padding: "20px",
          },
        });
      })
      .catch((err) => {
        console.error(err);

        toast.error("Whoops... Something went wrong :(", {
          duration: 8000,
          style: {
            background: "red",
            color: "white",
            fontWeight: "bolder",
            fontSize: "17px",
            padding: "20px",
          },
        });
      })
      .finally(() => {
        setLoading(false);
        toast.dismiss(notification);
      });
  };

  return (
    <div className="flex h-screen flex-col lg:grid lg:grid-cols-10">
      <Toaster position="bottom-center" />
      {/* Left */}
      <div className="bg-gradient-to-br from-cyan-800 to-rose-500 lg:col-span-4">
        <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
          <div className="bg-gradient-to-br from-yellow-400 to-purple-600 p-2 rounded-xl">
            <img
              className="w-44 rounded-xl object-cover lg:h-96 lg:w-72"
              src={urlFor(collection.previewImage).url()}
              alt=""
            />
          </div>
          <div className="text-center p-5 space-y-2">
            <h1 className="text-4xl font-bold text-white">
              {collection.nftCollectionName}
            </h1>
            <h2 className="text-xl text-gray-300">{collection.description}</h2>
          </div>
        </div>
      </div>
      {/* Right */}

      <div className="flex flex-1 flex-col p-12 lg:col-span-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/">
            <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
              The{" "}
              <span className="font-extrabold underline decoration-pink-600/50">
                BeaverX
              </span>{" "}
              NFT Marketplace
            </h1>
          </Link>
          <button
            onClick={() => (address ? disconnect() : connectWithMetamask())}
            className="rounded-full bg-rose-400 text-white px-4 py-2 text-extrasmall font-bold lg:px-5 lg:py-3 lg:text-base"
          >
            {address ? "Sign Out" : "Sign In"}
          </button>
        </header>

        <hr className="my-2 border" />

        {address && (
          <p className="text-center text-sm text-rose-400">
            You're logged in with wallet {address.substring(0, 5)} ...{" "}
            {address.substring(address.length - 5)}
          </p>
        )}
        {/*Content*/}

        <div className="mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:space-y-0 lg:justify-center">
          <img
            className="w-80 object-cover pb-10 lg:h-40"
            src={urlFor(collection.mainImage).url()}
            alt=""
          />
          <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">
            {collection.title}{" "}
          </h1>

          {loading ? (
            <p className="pt-2 text-xl text-green-500 animate-pulse">
              Loading Supply Count...
            </p>
          ) : (
            <p className="pt-2 text-xl text-green-500">
              {claimedSupply?.toString()} / {totalSupply?.toString()} NFTs
              claimed.
            </p>
          )}

          {loading && (
            <img
              className="h-80 w-80 object-contain"
              src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif"
              alt=""
            />
          )}
        </div>
        {/* Footer */}
        <button
          onClick={mintNft}
          disabled={
            loading ||
            claimedSupply?.toNumber() === totalSupply?.toNumber() ||
            !address
          }
          className="h-16 w-full bg-red-600 text-white rounded-full mt-10 font-bold disabled:bg-gray-400"
        >
          {loading ? (
            <>Loading...</>
          ) : claimedSupply?.toNumber() === totalSupply?.toNumber() ? (
            <>All NFTs minted!</>
          ) : !address ? (
            <>Sign in to mint</>
          ) : (
            <span className="font-bold">Mint NFT (free)</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default NFTDropPage;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `*[_type == "collection" && slug.current == $id][0]{
    _id,
    title,
    address,
    description,
    nftCollectionName,
    mainImage {
      asset,
    },
    previewImage {
      asset,
    },
    slug {
      current,
    },
    creator-> {
      _id,
      name,
      address,
      slug {
        current,
      },
    },
  }`;

  const collection = await sanityClient.fetch(query, {
    id: params?.id,
  });

  if (!collection) {
    return {
      notFound: true,
    };
  }

  return {
    props: { collection },
  };
};
