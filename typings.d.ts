interface Image {
  asset: {
    url: string;
  };
}

export interface Collection {
  _id: string;
  title: string;
  address: string;
  description: string;
  nftCollectionName: string;
  slug: {
    current: string;
  };
  mainImage: Image;
  previewImage: Image;
  creator: Creator;
}

export interface Creator {
  _id: string;
  name: string;
  address: string;
  slug: {
    current: string;
  };
  image: Image;
  bio: string;
}
