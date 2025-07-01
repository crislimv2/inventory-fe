'use client'
import { useEffect, useState } from "react";
import { Product } from "./interfaces/Product";
import Image from "next/image";
import { Button, Dropdown, Input, MenuProps, message, Space } from 'antd';
import { CaretDownOutlined, CloseOutlined, DropboxOutlined, SearchOutlined } from '@ant-design/icons';
import { alphabet } from "./constants/Alphabet";
const dummyData : Product[] =  [
    {
    id: "1",
    sku: "SKU-001",
    name: "Kapal Api Special Mix",
    description: "Kopi instan Kapal Api sachet 10 pcs.",
    price: 12000,
    quantity: 100,
    imageUrl: "https://via.placeholder.com/150",
    category: "Minuman",
    brand: "Kapal Api",
    barCode: "8991002100010",
    unitOfMeasure: "pack",
    createdAt: new Date("2024-01-01"),
    createdBy: "admin",
  },
  {
    id: "2",
    sku: "SKU-002",
    name: "Energen Cokelat",
    description: "Minuman sereal bergizi rasa cokelat isi 10 sachet.",
    price: 14000,
    quantity: 80,
    imageUrl: "https://via.placeholder.com/150",
    category: "Minuman",
    brand: "Energen",
    barCode: "8999999012345",
    unitOfMeasure: "pack",
    createdAt: new Date("2024-01-02"),
    createdBy: "admin",
  },
  {
    id: "3",
    sku: "SKU-003",
    name: "Indomie Goreng",
    description: "Mi instan goreng isi 5 pcs.",
    price: 13000,
    quantity: 200,
    imageUrl: "https://via.placeholder.com/150",
    category: "Makanan",
    brand: "Indomie",
    barCode: "8991002100230",
    unitOfMeasure: "pack",
    createdAt: new Date("2024-01-03"),
    createdBy: "admin",
  },
  {
    id: "4",
    sku: "SKU-004",
    name: "Lifebuoy Sabun Mandi",
    description: "Sabun batang antiseptik Lifebuoy 85g.",
    price: 3500,
    quantity: 300,
    imageUrl: "https://via.placeholder.com/150",
    category: "Kebersihan",
    brand: "Lifebuoy",
    barCode: "8999999002221",
    unitOfMeasure: "pcs",
    createdAt: new Date("2024-01-04"),
    createdBy: "admin",
  },
  {
    id: "5",
    sku: "SKU-005",
    name: "Rinso Deterjen Cair",
    description: "Deterjen cair 1.6L pouch.",
    price: 28000,
    quantity: 120,
    imageUrl: "https://via.placeholder.com/150",
    category: "Kebersihan",
    brand: "Rinso",
    barCode: "8999999033333",
    unitOfMeasure: "pack",
    createdAt: new Date("2024-01-05"),
    createdBy: "admin",
  },
  {
    id: "6",
    sku: "SKU-006",
    name: "Sampoerna Mild",
    description: "Rokok filter isi 16 batang.",
    price: 33000,
    quantity: 500,
    imageUrl: "https://via.placeholder.com/150",
    category: "Rokok",
    brand: "Sampoerna",
    barCode: "8999999099999",
    unitOfMeasure: "pack",
    createdAt: new Date("2024-01-06"),
    createdBy: "admin",
  },
  {
    id: "7",
    sku: "SKU-007",
    name: "Pocari Sweat",
    description: "Minuman ion botol 500ml.",
    price: 8000,
    quantity: 250,
    imageUrl: "https://via.placeholder.com/150",
    category: "Minuman",
    brand: "Pocari Sweat",
    barCode: "8999999076543",
    unitOfMeasure: "bottle",
    createdAt: new Date("2024-01-07"),
    createdBy: "admin",
  },
  {
    id: "8",
    sku: "SKU-008",
    name: "Tissue Paseo",
    description: "Tissue wajah 250 sheets.",
    price: 12000,
    quantity: 150,
    imageUrl: "https://via.placeholder.com/150",
    category: "Kebutuhan Rumah",
    brand: "Paseo",
    barCode: "8999999022222",
    unitOfMeasure: "pack",
    createdAt: new Date("2024-01-08"),
    createdBy: "admin",
  },
  {
    id: "9",
    sku: "SKU-009",
    name: "Aqua Botol 600ml",
    description: "Air mineral dalam kemasan botol.",
    price: 4000,
    quantity: 400,
    imageUrl: "https://via.placeholder.com/150",
    category: "Minuman",
    brand: "Aqua",
    barCode: "8999999011111",
    unitOfMeasure: "bottle",
    createdAt: new Date("2024-01-09"),
    createdBy: "admin",
  },
  {
    id: "10",
    sku: "SKU-010",
    name: "Roma Biskuit Kelapa",
    description: "Biskuit dengan taburan kelapa.",
    price: 9000,
    quantity: 180,
    imageUrl: "https://via.placeholder.com/150",
    category: "Makanan",
    brand: "Roma",
    barCode: "8999999009999",
    unitOfMeasure: "pack",
    createdAt: new Date("2024-01-10"),
    createdBy: "admin",
  },
  // Lanjutkan untuk 20 produk berikutnya dengan pola serupa:
  {
    id: "11",
    sku: "SKU-011",
    name: "Sunlight Jeruk Nipis 755ml",
    description: "Sabun cuci piring cair jeruk nipis.",
    price: 15000,
    quantity: 100,
    imageUrl: "https://via.placeholder.com/150",
    category: "Kebersihan",
    brand: "Sunlight",
    barCode: "8999999088888",
    unitOfMeasure: "bottle",
    createdAt: new Date("2024-01-11"),
    createdBy: "admin",
  },
  {
    id: "12",
    sku: "SKU-012",
    name: "Baygon Spray",
    description: "Anti nyamuk aerosol 600ml.",
    price: 32000,
    quantity: 90,
    imageUrl: "https://via.placeholder.com/150",
    category: "Kebersihan",
    brand: "Baygon",
    barCode: "8999999077777",
    unitOfMeasure: "can",
    createdAt: new Date("2024-01-12"),
    createdBy: "admin",
  },
  {
    id: "13",
    sku: "SKU-013",
    name: "Bimoli Minyak Goreng 1L",
    description: "Minyak goreng premium 1 liter.",
    price: 18000,
    quantity: 200,
    imageUrl: "https://via.placeholder.com/150",
    category: "Makanan",
    brand: "Bimoli",
    barCode: "8999999066666",
    unitOfMeasure: "bottle",
    createdAt: new Date("2024-01-13"),
    createdBy: "admin",
  },
  {
    id: "14",
    sku: "SKU-014",
    name: "Teh Botol Sosro 450ml",
    description: "Teh manis dalam botol.",
    price: 5000,
    quantity: 300,
    imageUrl: "https://via.placeholder.com/150",
    category: "Minuman",
    brand: "Sosro",
    barCode: "8999999055555",
    unitOfMeasure: "bottle",
    createdAt: new Date("2024-01-14"),
    createdBy: "admin",
  },
  {
    id: "15",
    sku: "SKU-015",
    name: "Pepsodent Pasta Gigi 190gr",
    description: "Pasta gigi untuk perlindungan menyeluruh.",
    price: 12000,
    quantity: 180,
    imageUrl: "https://via.placeholder.com/150",
    category: "Kesehatan",
    brand: "Pepsodent",
    barCode: "8999999044444",
    unitOfMeasure: "tube",
    createdAt: new Date("2024-01-15"),
    createdBy: "admin",
  },
  {
    id: "16",
    sku: "SKU-016",
    name: "Silver Queen Chunky Bar 65gr",
    description: "Cokelat batangan dengan kacang mete.",
    price: 12500,
    quantity: 100,
    imageUrl: "https://via.placeholder.com/150",
    category: "Makanan",
    brand: "Silver Queen",
    barCode: "8999999033331",
    unitOfMeasure: "pcs",
    createdAt: new Date("2024-01-16"),
    createdBy: "admin",
  },
  {
    id: "17",
    sku: "SKU-017",
    name: "Tango Wafer Cokelat 130gr",
    description: "Wafer lapis krim cokelat.",
    price: 9500,
    quantity: 120,
    imageUrl: "https://via.placeholder.com/150",
    category: "Makanan",
    brand: "Tango",
    barCode: "8999999022224",
    unitOfMeasure: "pack",
    createdAt: new Date("2024-01-17"),
    createdBy: "admin",
  },
  {
    id: "18",
    sku: "SKU-018",
    name: "Mie Sedap Soto",
    description: "Mi instan rasa soto lamongan.",
    price: 3000,
    quantity: 250,
    imageUrl: "https://via.placeholder.com/150",
    category: "Makanan",
    brand: "Mie Sedap",
    barCode: "8999999011113",
    unitOfMeasure: "pcs",
    createdAt: new Date("2024-01-18"),
    createdBy: "admin",
  },
  {
    id: "19",
    sku: "SKU-019",
    name: "Tolak Angin Cair",
    description: "Obat herbal masuk angin dalam sachet cair.",
    price: 6000,
    quantity: 80,
    imageUrl: "https://via.placeholder.com/150",
    category: "Kesehatan",
    brand: "Tolak Angin",
    barCode: "8999999009993",
    unitOfMeasure: "pcs",
    createdAt: new Date("2024-01-19"),
    createdBy: "admin",
  },
  {
    id: "20",
    sku: "SKU-020",
    name: "Good Day Cappuccino",
    description: "Minuman kopi instan rasa cappuccino.",
    price: 11000,
    quantity: 150,
    imageUrl: "https://via.placeholder.com/150",
    category: "Minuman",
    brand: "Good Day",
    barCode: "8999999088881",
    unitOfMeasure: "pack",
    createdAt: new Date("2024-01-20"),
    createdBy: "admin",
  },
  {
    id: "21",
    sku: "SKU-021",
    name: "Le Minerale 600ml",
    description: "Air mineral dalam botol PET.",
    price: 3500,
    quantity: 300,
    imageUrl: "https://via.placeholder.com/150",
    category: "Minuman",
    brand: "Le Minerale",
    barCode: "8999999077773",
    unitOfMeasure: "bottle",
    createdAt: new Date("2024-01-21"),
    createdBy: "admin",
  },
  {
    id: "22",
    sku: "SKU-022",
    name: "Molto Pewangi Pakaian 900ml",
    description: "Pelembut dan pewangi pakaian konsentrat.",
    price: 19000,
    quantity: 110,
    imageUrl: "https://via.placeholder.com/150",
    category: "Kebersihan",
    brand: "Molto",
    barCode: "8999999066662",
    unitOfMeasure: "pouch",
    createdAt: new Date("2024-01-22"),
    createdBy: "admin",
  },
  {
    id: "23",
    sku: "SKU-023",
    name: "Baygon Elektrik Refill",
    description: "Isi ulang anti nyamuk elektrik.",
    price: 22000,
    quantity: 75,
    imageUrl: "https://via.placeholder.com/150",
    category: "Kebersihan",
    brand: "Baygon",
    barCode: "8999999055551",
    unitOfMeasure: "pcs",
    createdAt: new Date("2024-01-23"),
    createdBy: "admin",
  },
  {
    id: "24",
    sku: "SKU-024",
    name: "Gulaku Gula Pasir 1kg",
    description: "Gula pasir putih kemasan 1kg.",
    price: 14000,
    quantity: 220,
    imageUrl: "https://via.placeholder.com/150",
    category: "Bahan Pokok",
    brand: "Gulaku",
    barCode: "8999999044441",
    unitOfMeasure: "pack",
    createdAt: new Date("2024-01-24"),
    createdBy: "admin",
  },
  {
    id: "25",
    sku: "SKU-025",
    name: "Sasa Tepung Bumbu Serbaguna",
    description: "Tepung bumbu siap pakai 210gr.",
    price: 7500,
    quantity: 180,
    imageUrl: "https://via.placeholder.com/150",
    category: "Bahan Masakan",
    brand: "Sasa",
    barCode: "8999999033335",
    unitOfMeasure: "pack",
    createdAt: new Date("2024-01-25"),
    createdBy: "admin",
  },
  {
    id: "26",
    sku: "SKU-026",
    name: "So Klin Pewangi Refill",
    description: "Pewangi pakaian isi ulang 800ml.",
    price: 17000,
    quantity: 130,
    imageUrl: "https://via.placeholder.com/150",
    category: "Kebersihan",
    brand: "So Klin",
    barCode: "8999999022229",
    unitOfMeasure: "pouch",
    createdAt: new Date("2024-01-26"),
    createdBy: "admin",
  },
  {
    id: "27",
    sku: "SKU-027",
    name: "Luwak White Coffee",
    description: "Kopi instan putih kemasan 10 sachet.",
    price: 15000,
    quantity: 140,
    imageUrl: "https://via.placeholder.com/150",
    category: "Minuman",
    brand: "Luwak",
    barCode: "8999999011119",
    unitOfMeasure: "pack",
    createdAt: new Date("2024-01-27"),
    createdBy: "admin",
  },
  {
    id: "28",
    sku: "SKU-028",
    name: "Sikat Gigi Formula Classic",
    description: "Sikat gigi manual bulu halus.",
    price: 7000,
    quantity: 90,
    imageUrl: "https://via.placeholder.com/150",
    category: "Kesehatan",
    brand: "Formula",
    barCode: "8999999009997",
    unitOfMeasure: "pcs",
    createdAt: new Date("2024-01-28"),
    createdBy: "admin",
  },
  {
    id: "29",
    sku: "SKU-029",
    name: "Dettol Hand Sanitizer 50ml",
    description: "Antiseptik tangan berbasis alkohol.",
    price: 10000,
    quantity: 60,
    imageUrl: "https://via.placeholder.com/150",
    category: "Kesehatan",
    brand: "Dettol",
    barCode: "8999999088885",
    unitOfMeasure: "bottle",
    createdAt: new Date("2024-01-29"),
    createdBy: "admin",
  },
  {
    id: "30",
    sku: "SKU-030",
    name: "Coca Cola Kaleng 330ml",
    description: "Minuman bersoda dalam kemasan kaleng.",
    price: 6500,
    quantity: 200,
    imageUrl: "https://via.placeholder.com/150",
    category: "Minuman",
    brand: "Coca Cola",
    barCode: "8999999077779",
    unitOfMeasure: "can",
    createdAt: new Date("2024-01-30"),
    createdBy: "admin",
  }
];

const items: MenuProps['items'] = [
  {
    label: 'Kopi',
    key: '1',
  },
  {
    label: 'Rokok',
    key: '2',
  },
  {
    label: 'Sabun Mandi',
    key: '3',
  },
  {
    label: 'Sabun Cuci',
    key: '4',
  },
  {
    label: 'Minuman Saset',
    key: '5',
  },
];

const handleMenuClick: MenuProps['onClick'] = (e) => {
  message.info('Click on menu item.');
  console.log('click', e);
};

const menuProps = {
  items,
  onClick: handleMenuClick,
};

const CardLeftPanel = () => {
    const  [products, setProducts] = useState<Product[]>();
    const [search, setSearch] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeLetter, setActiveLetter] = useState('');


    const handleDropdownOpenChange = (flag: boolean) => {
      setIsDropdownOpen(flag);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setActiveLetter('');
    };

    const handleLetterClick = (letter: string) => {
        setActiveLetter(letter);
        setSearch(letter);
        if( letter === activeLetter) {
            setSearch("");
            setActiveLetter('');
            setProducts(dummyData);
        }
    }

    useEffect(() => {
        setTimeout(() => {
            setProducts(dummyData);
        }, 1000);
    }, []);

    useEffect(() => {
        if (search.length > 1) {
            console.log("Searching for:", search);
            const filteredProducts = dummyData.filter(product => 
                product.name.toLowerCase().includes(search.toLowerCase())
            );
            setProducts(filteredProducts);
        } else if (search === "") {
            console.log("Resetting to all products");
            setProducts(dummyData);
        }
        else {
            console.log("Filtering by letter:", activeLetter);
            const res = dummyData?.filter(product => product.name.toLocaleLowerCase().startsWith(search?.toLocaleLowerCase()));
            setProducts(res);
        }
    }, [search]);

    return (
      <div className="bg-gray-100">
        <div className="bg-gray-200 p-4 mb-4">
          <h1 className="text-2xl font-bold text-black">Product List</h1>
          <div className="flex justify-between items-center gap-20">
            <Dropdown 
              menu={menuProps}  
              trigger={['click']}
              open={isDropdownOpen}
              onOpenChange={handleDropdownOpenChange}
            >
              <Button 
                size="large" 
                icon={<DropboxOutlined className={`text-[17px]`} />} 
                className="bg-white border border-gray-300 hover:bg-gray-50" 
                style={{
                  padding: "10px 18px",
                  fontSize: "16px",
                  height: "auto"
                }}
              >
                <Space>
                  <h3 className="text-black font-semibold text-xl">Category</h3>
                  <CaretDownOutlined
                    className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                    style={{ color: "black" }}
                  />
                </Space>
              </Button>
            </Dropdown>

            <Input 
              size="large" 
              value={search}
              onChange={handleSearchChange} 
              placeholder="Cari Nama Barang.." 
              suffix={
                search!="" && (
                  <CloseOutlined 
                    className="cursor-pointer" 
                    onClick={() => setSearch("")}
                  />
                )
              }
              prefix={<SearchOutlined className={`p-1 mr-1 text-[17px]`}/>} 
              style={{
                  padding: "12px 18px",
                  fontSize: "16px",
                  height: "auto"
                }}
            />
          </div>
        </div>

        <div className="flex">
          {/* Alphabet Sidebar */}
          <div className="border-x-2 rounded px-1 sticky top-12 left-0 flex flex-col h-screen mt-2">
            {alphabet.map((letter) => (
              <button
                key={letter}
                className={`px-1 text-lg mb-1 cursor-pointer transition-colors duration-150
                  ${activeLetter === letter ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-500"}`}
                onClick={() => handleLetterClick(letter)}
              >
                {letter}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-hidden p-2 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-hidden">
              {products ? products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow px-3 py-2"
                >
                  {product.imageUrl && (
                    <Image
                      src={'/1rcgKA.jpg'}
                      alt={product.name}
                      width={150}
                      height={150}
                      className="object-cover mb-2 rounded"
                    />
                  )}
                  <h2 className="text-md font-bold text-black">{product.name}</h2>
                  <p className="text-sm text-gray-800 font-semibold">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                </div>
              )) : []}
            </div>
          </div>
        </div>
      </div>
    )
}

export default CardLeftPanel;