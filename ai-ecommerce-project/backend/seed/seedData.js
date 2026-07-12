require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const User = require("../models/User");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Review = require("../models/Review");

const products = [
  { name: "Running Shoes", description: "Lightweight breathable running shoes for daily training", price: 1899, category: "Footwear", tags: ["shoes", "sports", "running", "men"], image: "https://loremflickr.com/400/400/shoes,sports", rating: 4.5, numReviews: 128, stock: 45, views: 210 },
  { name: "Casual Sneakers", description: "Comfortable everyday sneakers with cushioned sole", price: 2299, category: "Footwear", tags: ["shoes", "casual", "sneakers"], image: "https://loremflickr.com/400/400/shoes,casual", rating: 4.2, numReviews: 84, stock: 30, views: 150 },
  { name: "Formal Leather Shoes", description: "Premium leather formal shoes for office and events", price: 3499, category: "Footwear", tags: ["shoes", "formal", "leather"], image: "https://loremflickr.com/400/400/shoes,formal", rating: 4.6, numReviews: 61, stock: 18, views: 95 },
  { name: "Hiking Boots", description: "Waterproof ankle-support hiking boots", price: 4199, category: "Footwear", tags: ["shoes", "outdoor", "hiking", "boots"], image: "https://loremflickr.com/400/400/shoes,outdoor", rating: 4.7, numReviews: 39, stock: 12, views: 70 },
  { name: "Flip Flops", description: "Soft rubber flip flops for daily home/beach use", price: 349, category: "Footwear", tags: ["slippers", "casual", "summer"], image: "https://loremflickr.com/400/400/slippers,casual", rating: 4, numReviews: 205, stock: 90, views: 300 },
  { name: "High Top Basketball Shoes", description: "High-ankle shoes with impact-absorbing sole", price: 3999, category: "Footwear", tags: ["shoes", "sports", "basketball"], image: "https://loremflickr.com/400/400/shoes,sports", rating: 4.4, numReviews: 52, stock: 20, views: 88 },
  { name: "Wireless Headphones", description: "Noise cancelling over-ear headphones with 30hr battery", price: 2799, category: "Electronics", tags: ["audio", "wireless", "headphones"], image: "https://loremflickr.com/400/400/audio,wireless", rating: 4.6, numReviews: 312, stock: 40, views: 520 },
  { name: "Bluetooth Earbuds", description: "Compact true wireless earbuds with charging case", price: 1499, category: "Electronics", tags: ["audio", "wireless", "earbuds"], image: "https://loremflickr.com/400/400/audio,wireless", rating: 4.3, numReviews: 198, stock: 55, views: 410 },
  { name: "Smart Watch", description: "Fitness tracking smart watch with heart-rate monitor", price: 3999, category: "Electronics", tags: ["wearable", "smart", "fitness"], image: "https://loremflickr.com/400/400/wearable,smart", rating: 2.3, numReviews: 176, stock: 25, views: 380 },
  { name: "Portable Bluetooth Speaker", description: "Waterproof speaker with deep bass and 12hr playtime", price: 1999, category: "Electronics", tags: ["audio", "speaker", "bluetooth"], image: "https://loremflickr.com/400/400/audio,speaker", rating: 4.4, numReviews: 143, stock: 35, views: 290 },
  { name: "Mechanical Keyboard", description: "RGB backlit mechanical keyboard with blue switches", price: 2599, category: "Electronics", tags: ["computer", "keyboard", "gaming"], image: "https://loremflickr.com/400/400/computer,keyboard", rating: 4.7, numReviews: 88, stock: 22, views: 190 },
  { name: "Wireless Mouse", description: "Ergonomic wireless mouse with silent clicks", price: 799, category: "Electronics", tags: ["computer", "mouse", "wireless"], image: "https://loremflickr.com/400/400/computer,mouse", rating: 4.2, numReviews: 210, stock: 60, views: 260 },
  { name: "Power Bank 20000mAh", description: "Fast charging power bank with dual USB output", price: 1299, category: "Electronics", tags: ["power", "charger", "portable"], image: "https://loremflickr.com/400/400/power,charger", rating: 4.3, numReviews: 245, stock: 70, views: 330 },
  { name: "4K Action Camera", description: "Waterproof 4K action camera with mounts", price: 5499, category: "Electronics", tags: ["camera", "action", "outdoor"], image: "https://loremflickr.com/400/400/camera,action", rating: 4.6, numReviews: 47, stock: 10, views: 105 },
  { name: "Cotton T-Shirt", description: "100% cotton round neck t-shirt, breathable fabric", price: 499, category: "Clothing", tags: ["t-shirt", "cotton", "casual"], image: "https://loremflickr.com/400/400/t-shirt,cotton", rating: 4.1, numReviews: 302, stock: 120, views: 400 },
  { name: "Denim Jacket", description: "Classic blue denim jacket for all seasons", price: 1999, category: "Clothing", tags: ["jacket", "denim", "winter"], image: "https://loremflickr.com/400/400/jacket,denim", rating: 4.4, numReviews: 96, stock: 40, views: 220 },
  { name: "Men's Slim Fit Jeans", description: "Stretchable slim fit denim jeans for everyday wear", price: 1499, category: "Clothing", tags: ["jeans", "denim", "men", "casual"], image: "https://loremflickr.com/400/400/jeans,denim", rating: 4.3, numReviews: 176, stock: 58, views: 260 },
  { name: "Women's Skinny Jeans", description: "High-waist skinny fit jeans with stretch fabric", price: 1599, category: "Clothing", tags: ["jeans", "denim", "women", "casual"], image: "https://loremflickr.com/400/400/jeans,women", rating: 2.7, numReviews: 143, stock: 46, views: 230 },
  { name: "Formal Shirt", description: "Slim fit formal office shirt, wrinkle-free", price: 899, category: "Clothing", tags: ["shirt", "formal", "office"], image: "https://loremflickr.com/400/400/shirt,formal", rating: 4.2, numReviews: 134, stock: 55, views: 240 },
  { name: "Women's Kurti", description: "Printed cotton kurti, comfortable daily wear", price: 799, category: "Clothing", tags: ["kurti", "women", "ethnic"], image: "https://loremflickr.com/400/400/kurti,women", rating: 4.5, numReviews: 158, stock: 65, views: 280 },
  { name: "Hooded Sweatshirt", description: "Fleece-lined hoodie for winter comfort", price: 1299, category: "Clothing", tags: ["hoodie", "winter", "casual"], image: "https://loremflickr.com/400/400/hoodie,winter", rating: 4.3, numReviews: 112, stock: 48, views: 210 },
  { name: "Track Pants", description: "Stretchable track pants for gym and running", price: 699, category: "Clothing", tags: ["pants", "sports", "gym"], image: "https://loremflickr.com/400/400/pants,sports", rating: 4, numReviews: 89, stock: 70, views: 180 },
  { name: "Laptop Backpack", description: "Water resistant laptop backpack with USB port", price: 1299, category: "Accessories", tags: ["bag", "backpack", "travel"], image: "https://loremflickr.com/400/400/bag,backpack", rating: 4.5, numReviews: 176, stock: 38, views: 300 },
  { name: "Sunglasses", description: "UV protection stylish unisex sunglasses", price: 799, category: "Accessories", tags: ["eyewear", "fashion", "sunglasses"], image: "https://loremflickr.com/400/400/eyewear,fashion", rating: 4.2, numReviews: 92, stock: 50, views: 170 },
  { name: "Leather Wallet", description: "Genuine leather bifold wallet with card slots", price: 599, category: "Accessories", tags: ["wallet", "leather", "men"], image: "https://loremflickr.com/400/400/wallet,leather", rating: 4.4, numReviews: 121, stock: 60, views: 200 },
  { name: "Analog Wrist Watch", description: "Classic analog watch with leather strap", price: 1599, category: "Accessories", tags: ["watch", "analog", "fashion"], image: "https://loremflickr.com/400/400/watch,analog", rating: 4.6, numReviews: 67, stock: 25, views: 140 },
  { name: "Baseball Cap", description: "Adjustable cotton baseball cap", price: 349, category: "Accessories", tags: ["cap", "casual", "summer"], image: "https://loremflickr.com/400/400/cap,casual", rating: 3.1, numReviews: 58, stock: 80, views: 110 },
  { name: "Non-Stick Frying Pan", description: "Induction-friendly non-stick frying pan", price: 899, category: "Home & Kitchen", tags: ["kitchen", "cookware", "pan"], image: "https://loremflickr.com/400/400/kitchen,cookware", rating: 4.4, numReviews: 143, stock: 44, views: 190 },
  { name: "Electric Kettle", description: "1.5L fast-boil electric kettle with auto shut-off", price: 999, category: "Home & Kitchen", tags: ["kitchen", "appliance", "kettle"], image: "https://loremflickr.com/400/400/kitchen,appliance", rating: 4.3, numReviews: 187, stock: 52, views: 230 },
  { name: "LED Study Lamp", description: "Adjustable brightness LED desk lamp", price: 749, category: "Home & Kitchen", tags: ["lamp", "study", "led"], image: "https://loremflickr.com/400/400/lamp,study", rating: 4.5, numReviews: 98, stock: 36, views: 165 },
  { name: "Cotton Bedsheet Set", description: "King size cotton bedsheet with 2 pillow covers", price: 1199, category: "Home & Kitchen", tags: ["bedsheet", "home", "cotton"], image: "https://loremflickr.com/400/400/bedsheet,home", rating: 4.2, numReviews: 76, stock: 30, views: 130 },
  { name: "Vacuum Flask 1L", description: "Insulated stainless steel flask, keeps hot 12hrs", price: 649, category: "Home & Kitchen", tags: ["flask", "kitchen", "insulated"], image: "https://loremflickr.com/400/400/flask,kitchen", rating: 4.6, numReviews: 154, stock: 60, views: 210 },
  { name: "Wall Clock", description: "Minimalist silent-sweep wall clock", price: 549, category: "Home & Kitchen", tags: ["clock", "home", "decor"], image: "https://loremflickr.com/400/400/clock,home", rating: 4.1, numReviews: 42, stock: 40, views: 90 },
  { name: "Face Moisturizer", description: "Non-greasy daily face moisturizer with SPF", price: 399, category: "Beauty & Personal Care", tags: ["skincare", "beauty", "moisturizer"], image: "https://loremflickr.com/400/400/skincare,beauty", rating: 4.4, numReviews: 210, stock: 90, views: 260 },
  { name: "Hair Dryer", description: "Compact 1200W hair dryer with cool-shot", price: 1099, category: "Beauty & Personal Care", tags: ["haircare", "appliance", "dryer"], image: "https://loremflickr.com/400/400/haircare,appliance", rating: 4.3, numReviews: 88, stock: 34, views: 150 },
  { name: "Perfume 100ml", description: "Long-lasting unisex eau de parfum", price: 1499, category: "Beauty & Personal Care", tags: ["fragrance", "perfume", "beauty"], image: "https://loremflickr.com/400/400/fragrance,perfume", rating: 3.4, numReviews: 132, stock: 28, views: 200 },
  { name: "Electric Trimmer", description: "Cordless beard trimmer with 20 length settings", price: 899, category: "Beauty & Personal Care", tags: ["grooming", "trimmer", "men"], image: "https://loremflickr.com/400/400/grooming,trimmer", rating: 4.5, numReviews: 165, stock: 45, views: 220 },
  { name: "Lipstick Set", description: "Matte finish lipstick set, 4 shades", price: 599, category: "Beauty & Personal Care", tags: ["makeup", "lipstick", "beauty"], image: "https://loremflickr.com/400/400/makeup,lipstick", rating: 4.2, numReviews: 97, stock: 50, views: 175 },
  { name: "Atomic Habits", description: "Bestselling self-improvement book on building habits", price: 399, category: "Books", tags: ["book", "self-help", "bestseller"], image: "https://loremflickr.com/400/400/book,self-help", rating: 4.8, numReviews: 421, stock: 100, views: 500 },
  { name: "The Alchemist", description: "Classic novel about following your dreams", price: 299, category: "Books", tags: ["book", "fiction", "classic"], image: "https://loremflickr.com/400/400/book,fiction", rating: 4.7, numReviews: 389, stock: 95, views: 460 },
  { name: "Rich Dad Poor Dad", description: "Personal finance and investing classic", price: 349, category: "Books", tags: ["book", "finance", "bestseller"], image: "https://loremflickr.com/400/400/book,finance", rating: 4.6, numReviews: 298, stock: 80, views: 400 },
  { name: "Clean Code", description: "A handbook of agile software craftsmanship", price: 899, category: "Books", tags: ["book", "programming", "technical"], image: "https://loremflickr.com/400/400/book,programming", rating: 4.5, numReviews: 156, stock: 40, views: 250 },
  { name: "Sapiens", description: "A brief history of humankind", price: 499, category: "Books", tags: ["book", "history", "nonfiction"], image: "https://loremflickr.com/400/400/book,history", rating: 4.7, numReviews: 267, stock: 60, views: 320 },
  { name: "Yoga Mat", description: "Non-slip 6mm thick yoga and exercise mat", price: 599, category: "Sports & Fitness", tags: ["yoga", "fitness", "mat"], image: "https://loremflickr.com/400/400/yoga,fitness", rating: 4.5, numReviews: 189, stock: 70, views: 280 },
  { name: "Adjustable Dumbbells", description: "Pair of adjustable dumbbells, 2-10kg", price: 2499, category: "Sports & Fitness", tags: ["gym", "dumbbells", "fitness"], image: "https://loremflickr.com/400/400/gym,dumbbells", rating: 3.6, numReviews: 94, stock: 20, views: 160 },
  { name: "Resistance Bands Set", description: "5-piece resistance bands for strength training", price: 449, category: "Sports & Fitness", tags: ["fitness", "bands", "home-gym"], image: "https://loremflickr.com/400/400/fitness,bands", rating: 4.3, numReviews: 132, stock: 55, views: 190 },
  { name: "Cricket Bat", description: "English willow cricket bat, full size", price: 2999, category: "Sports & Fitness", tags: ["cricket", "sports", "bat"], image: "https://loremflickr.com/400/400/cricket,sports", rating: 4.4, numReviews: 47, stock: 15, views: 100 },
  { name: "Football", description: "Size 5 match-quality football", price: 799, category: "Sports & Fitness", tags: ["football", "sports", "outdoor"], image: "https://loremflickr.com/400/400/football,sports", rating: 4.2, numReviews: 78, stock: 45, views: 140 },
  { name: "Remote Control Car", description: "High-speed RC car with rechargeable battery", price: 1499, category: "Toys & Games", tags: ["toy", "rc-car", "kids"], image: "https://loremflickr.com/400/400/toy,rc-car", rating: 4.4, numReviews: 112, stock: 30, views: 200 },
  { name: "Building Blocks Set", description: "500-piece creative building blocks for kids", price: 999, category: "Toys & Games", tags: ["toy", "blocks", "kids"], image: "https://loremflickr.com/400/400/toy,blocks", rating: 4.6, numReviews: 156, stock: 40, views: 230 },
  { name: "Chess Set", description: "Wooden folding chess set with storage", price: 649, category: "Toys & Games", tags: ["board-game", "chess", "family"], image: "https://loremflickr.com/400/400/board-game,chess", rating: 4.5, numReviews: 89, stock: 35, views: 150 },
  { name: "Almonds 500g", description: "Premium California almonds, roasted-ready", price: 449, category: "Grocery & Gourmet", tags: ["dry-fruits", "healthy", "snacks"], image: "https://loremflickr.com/400/400/dry-fruits,healthy", rating: 4.5, numReviews: 203, stock: 100, views: 280 },
  { name: "Organic Honey 500g", description: "Pure organic honey, no added sugar", price: 349, category: "Grocery & Gourmet", tags: ["honey", "organic", "healthy"], image: "https://loremflickr.com/400/400/honey,organic", rating: 4.6, numReviews: 178, stock: 90, views: 250 },
  { name: "Green Tea 100 Bags", description: "Antioxidant-rich green tea bags", price: 299, category: "Grocery & Gourmet", tags: ["tea", "healthy", "beverage"], image: "https://loremflickr.com/400/400/tea,healthy", rating: 3.8, numReviews: 145, stock: 110, views: 210 },

  // ---- Extra everyday items so common searches actually return results ----
  { name: "Stainless Steel Water Bottle", description: "1L insulated stainless steel water bottle, keeps water cold 24hrs", price: 499, category: "Home & Kitchen", tags: ["water bottle", "bottle", "kitchen", "travel"], image: "https://loremflickr.com/400/400/water,bottle", rating: 4.5, numReviews: 234, stock: 85, views: 300 },
  { name: "Sports Water Bottle 1L", description: "Leak-proof plastic sports water bottle with sipper", price: 249, category: "Sports & Fitness", tags: ["water bottle", "bottle", "sports", "gym"], image: "https://loremflickr.com/400/400/water,sports", rating: 4.2, numReviews: 167, stock: 100, views: 220 },
  { name: "School Backpack", description: "Spacious school backpack with multiple compartments", price: 999, category: "Accessories", tags: ["bag", "backpack", "school", "kids"], image: "https://loremflickr.com/400/400/backpack,school", rating: 4.3, numReviews: 142, stock: 50, views: 210 },
  { name: "Travel Umbrella", description: "Compact windproof 3-fold umbrella", price: 399, category: "Accessories", tags: ["umbrella", "rain", "travel"], image: "https://loremflickr.com/400/400/umbrella,travel", rating: 4.1, numReviews: 88, stock: 70, views: 130 },
  { name: "Spiral Notebook Set", description: "Pack of 5 ruled spiral notebooks, 200 pages each", price: 299, category: "Books", tags: ["notebook", "stationery", "school"], image: "https://loremflickr.com/400/400/notebook,stationery", rating: 4.4, numReviews: 96, stock: 90, views: 150 },
  { name: "Mixer Grinder 750W", description: "3-jar mixer grinder for everyday kitchen use", price: 2199, category: "Home & Kitchen", tags: ["kitchen", "appliance", "mixer", "grinder"], image: "https://loremflickr.com/400/400/mixer,kitchen", rating: 4.5, numReviews: 178, stock: 32, views: 240 },
  { name: "Pressure Cooker 5L", description: "Induction-base aluminium pressure cooker", price: 1399, category: "Home & Kitchen", tags: ["kitchen", "cooker", "cookware"], image: "https://loremflickr.com/400/400/cooker,kitchen", rating: 4.6, numReviews: 201, stock: 40, views: 260 },
  { name: "Bath Towel Set", description: "Soft cotton bath towel set, pack of 2", price: 599, category: "Home & Kitchen", tags: ["towel", "bath", "cotton", "home"], image: "https://loremflickr.com/400/400/towel,bath", rating: 4.2, numReviews: 74, stock: 55, views: 120 },
  { name: "Formal Trousers", description: "Slim fit formal trousers for office wear", price: 1099, category: "Clothing", tags: ["trousers", "pants", "formal", "office"], image: "https://loremflickr.com/400/400/trousers,formal", rating: 2.3, numReviews: 88, stock: 44, views: 160 },
  { name: "Women's Handbag", description: "Faux leather handbag with adjustable strap", price: 1299, category: "Accessories", tags: ["bag", "handbag", "women", "fashion"], image: "https://loremflickr.com/400/400/handbag,women", rating: 4.4, numReviews: 119, stock: 36, views: 180 },
  { name: "Kids Puzzle Toy", description: "Wooden educational puzzle toy for toddlers", price: 449, category: "Toys & Games", tags: ["toy", "puzzle", "kids", "educational"], image: "https://loremflickr.com/400/400/toy,puzzle", rating: 4.5, numReviews: 103, stock: 60, views: 150 },
  { name: "Teddy Bear 3ft", description: "Soft plush teddy bear, great birthday gift", price: 899, category: "Toys & Games", tags: ["toy", "teddy", "kids", "gift"], image: "https://loremflickr.com/400/400/toy,teddy", rating: 4.7, numReviews: 187, stock: 28, views: 210 },
  { name: "Skin Care Combo", description: "Face wash, toner and moisturizer skincare combo", price: 799, category: "Beauty & Personal Care", tags: ["skincare", "beauty", "combo"], image: "https://loremflickr.com/400/400/skincare,combo", rating: 4.3, numReviews: 122, stock: 48, views: 190 },
  { name: "Sports Cap", description: "Breathable sports cap with UV protection", price: 349, category: "Sports & Fitness", tags: ["cap", "sports", "outdoor"], image: "https://loremflickr.com/400/400/cap,sports", rating: 4, numReviews: 55, stock: 65, views: 100 },
  { name: "Badminton Racket Set", description: "Pair of badminton rackets with shuttlecocks", price: 899, category: "Sports & Fitness", tags: ["badminton", "sports", "racket"], image: "https://loremflickr.com/400/400/badminton,sports", rating: 4.4, numReviews: 76, stock: 32, views: 140 },

  // ---- 31 more products so the catalog totals 100, spread across all existing categories ----
  { name: "Formal Suede Loafers", description: "Slip-on suede loafers for semi-formal occasions", price: 2799, category: "Footwear", tags: ["shoes", "loafers", "formal", "men"], image: "https://loremflickr.com/400/400/loafers,formal", rating: 4.3, numReviews: 58, stock: 26, views: 110 },
  { name: "Kids School Shoes", description: "Durable black school shoes with Velcro strap", price: 999, category: "Footwear", tags: ["shoes", "kids", "school"], image: "https://loremflickr.com/400/400/shoes,kids", rating: 4.4, numReviews: 87, stock: 50, views: 140 },
  { name: "Waterproof Rain Boots", description: "Ankle-length waterproof rubber rain boots", price: 1299, category: "Footwear", tags: ["shoes", "rain", "waterproof", "boots"], image: "https://loremflickr.com/400/400/boots,rain", rating: 2.7, numReviews: 44, stock: 35, views: 95 },

  { name: "Gaming Mouse Pad", description: "Extended RGB gaming mouse pad with stitched edges", price: 699, category: "Electronics", tags: ["computer", "mousepad", "gaming"], image: "https://loremflickr.com/400/400/mousepad,gaming", rating: 4.5, numReviews: 112, stock: 60, views: 180 },
  { name: "USB-C Hub 6-in-1", description: "USB-C hub with HDMI, USB 3.0 and SD card slots", price: 1599, category: "Electronics", tags: ["computer", "usb", "hub", "adapter"], image: "https://loremflickr.com/400/400/usb,hub", rating: 4.4, numReviews: 73, stock: 40, views: 150 },
  { name: "Noise Cancelling Neckband", description: "Bluetooth neckband earphones with 20hr battery", price: 1199, category: "Electronics", tags: ["audio", "wireless", "neckband"], image: "https://loremflickr.com/400/400/neckband,audio", rating: 4.3, numReviews: 165, stock: 48, views: 230 },

  { name: "Women's Maxi Dress", description: "Flowy floral maxi dress for summer daywear", price: 1399, category: "Clothing", tags: ["dress", "women", "summer"], image: "https://loremflickr.com/400/400/dress,women", rating: 4.5, numReviews: 96, stock: 34, views: 170 },
  { name: "Men's Polo T-Shirt", description: "Pique cotton polo t-shirt with ribbed collar", price: 799, category: "Clothing", tags: ["polo", "t-shirt", "men", "casual"], image: "https://loremflickr.com/400/400/polo,shirt", rating: 4.3, numReviews: 154, stock: 70, views: 210 },
  { name: "Winter Puffer Jacket", description: "Lightweight insulated puffer jacket for winter", price: 2499, category: "Clothing", tags: ["jacket", "winter", "puffer"], image: "https://loremflickr.com/400/400/jacket,winter", rating: 4.6, numReviews: 88, stock: 28, views: 160 },

  { name: "Digital Wrist Watch", description: "Sporty digital watch with stopwatch and backlight", price: 899, category: "Accessories", tags: ["watch", "digital", "sports"], image: "https://loremflickr.com/400/400/watch,digital", rating: 4.2, numReviews: 63, stock: 45, views: 120 },
  { name: "Canvas Tote Bag", description: "Durable canvas tote bag for everyday carry", price: 449, category: "Accessories", tags: ["bag", "tote", "canvas"], image: "https://loremflickr.com/400/400/tote,bag", rating: 4.3, numReviews: 71, stock: 55, views: 130 },
  { name: "Leather Belt", description: "Genuine leather belt with classic buckle", price: 599, category: "Accessories", tags: ["belt", "leather", "men"], image: "https://loremflickr.com/400/400/belt,leather", rating: 3.1, numReviews: 82, stock: 60, views: 140 },

  { name: "Air Fryer 4L", description: "Digital 4L air fryer for oil-free cooking", price: 3999, category: "Home & Kitchen", tags: ["kitchen", "appliance", "airfryer"], image: "https://loremflickr.com/400/400/airfryer,kitchen", rating: 4.6, numReviews: 187, stock: 24, views: 250 },
  { name: "Ceramic Dinner Set", description: "16-piece ceramic dinner set for 4 people", price: 1899, category: "Home & Kitchen", tags: ["kitchen", "dinnerware", "ceramic"], image: "https://loremflickr.com/400/400/dinnerware,kitchen", rating: 4.4, numReviews: 65, stock: 20, views: 110 },
  { name: "Rice Cooker 1.8L", description: "Automatic rice cooker with keep-warm function", price: 1699, category: "Home & Kitchen", tags: ["kitchen", "appliance", "rice-cooker"], image: "https://loremflickr.com/400/400/ricecooker,kitchen", rating: 4.5, numReviews: 102, stock: 30, views: 160 },

  { name: "Sunscreen SPF50", description: "Non-greasy broad-spectrum sunscreen lotion", price: 449, category: "Beauty & Personal Care", tags: ["skincare", "sunscreen", "beauty"], image: "https://loremflickr.com/400/400/sunscreen,skincare", rating: 4.5, numReviews: 176, stock: 80, views: 210 },
  { name: "Beard Oil", description: "Nourishing beard oil with argan and jojoba", price: 349, category: "Beauty & Personal Care", tags: ["grooming", "beard", "men"], image: "https://loremflickr.com/400/400/beard,grooming", rating: 4.4, numReviews: 94, stock: 55, views: 140 },
  { name: "Nail Polish Set", description: "6-piece long-lasting nail polish set", price: 499, category: "Beauty & Personal Care", tags: ["makeup", "nailpolish", "beauty"], image: "https://loremflickr.com/400/400/nailpolish,makeup", rating: 4.2, numReviews: 68, stock: 60, views: 120 },

  { name: "Ikigai", description: "Japanese philosophy book on finding purpose", price: 349, category: "Books", tags: ["book", "self-help", "philosophy"], image: "https://loremflickr.com/400/400/book,philosophy", rating: 4.6, numReviews: 214, stock: 70, views: 260 },
  { name: "The Psychology of Money", description: "Timeless lessons on wealth and happiness", price: 399, category: "Books", tags: ["book", "finance", "bestseller"], image: "https://loremflickr.com/400/400/book,finance", rating: 4.7, numReviews: 302, stock: 85, views: 310 },
  { name: "Harry Potter and the Sorcerer's Stone", description: "The first book in the beloved fantasy series", price: 499, category: "Books", tags: ["book", "fiction", "fantasy"], image: "https://loremflickr.com/400/400/book,fantasy", rating: 3.4, numReviews: 512, stock: 90, views: 420 },
  { name: "Percy Jackson: The Lightning Thief", description: "Adventure novel blending Greek myth and modern life", price: 399, category: "Books", tags: ["book", "fiction", "adventure"], image: "https://loremflickr.com/400/400/book,adventure", rating: 4.6, numReviews: 187, stock: 65, views: 230 },

  { name: "Skipping Rope", description: "Adjustable speed skipping rope for cardio workouts", price: 249, category: "Sports & Fitness", tags: ["fitness", "rope", "cardio"], image: "https://loremflickr.com/400/400/rope,fitness", rating: 4.3, numReviews: 98, stock: 90, views: 150 },
  { name: "Table Tennis Paddle Set", description: "Pair of table tennis paddles with 3 balls", price: 599, category: "Sports & Fitness", tags: ["tabletennis", "sports", "paddle"], image: "https://loremflickr.com/400/400/tabletennis,sports", rating: 4.4, numReviews: 54, stock: 34, views: 100 },
  { name: "Gym Gloves", description: "Breathable padded gym gloves with wrist support", price: 449, category: "Sports & Fitness", tags: ["gym", "gloves", "fitness"], image: "https://loremflickr.com/400/400/gloves,gym", rating: 4.2, numReviews: 71, stock: 48, views: 120 },

  { name: "Doll House Playset", description: "3-storey wooden doll house with furniture set", price: 1899, category: "Toys & Games", tags: ["toy", "dollhouse", "kids"], image: "https://loremflickr.com/400/400/dollhouse,toy", rating: 4.6, numReviews: 132, stock: 22, views: 190 },
  { name: "Puzzle Cube", description: "Classic 3x3 speed puzzle cube", price: 299, category: "Toys & Games", tags: ["toy", "puzzle", "cube"], image: "https://loremflickr.com/400/400/cube,puzzle", rating: 4.5, numReviews: 176, stock: 75, views: 220 },
  { name: "Kids Tricycle", description: "Sturdy tricycle with safety handle for toddlers", price: 2499, category: "Toys & Games", tags: ["toy", "tricycle", "kids"], image: "https://loremflickr.com/400/400/tricycle,kids", rating: 4.5, numReviews: 89, stock: 18, views: 140 },

  { name: "Basmati Rice 5kg", description: "Premium aged basmati rice, long grain", price: 599, category: "Grocery & Gourmet", tags: ["rice", "grocery", "staple"], image: "https://loremflickr.com/400/400/rice,grocery", rating: 4.6, numReviews: 143, stock: 100, views: 200 },
  { name: "Extra Virgin Olive Oil 1L", description: "Cold-pressed extra virgin olive oil", price: 899, category: "Grocery & Gourmet", tags: ["oil", "grocery", "healthy"], image: "https://loremflickr.com/400/400/oliveoil,grocery", rating: 3.6, numReviews: 98, stock: 70, views: 160 },
  { name: "Dark Chocolate Bar Pack", description: "Pack of 6 70% dark chocolate bars", price: 449, category: "Grocery & Gourmet", tags: ["chocolate", "snacks", "grocery"], image: "https://loremflickr.com/400/400/chocolate,snacks", rating: 4.7, numReviews: 221, stock: 90, views: 250 },

  // ---- 100 more products (10 per category) so the catalog totals 200, all unique names ----
  { name: "Slip-On Canvas Shoes", description: "Lightweight canvas slip-on shoes for daily wear", price: 899, category: "Footwear", tags: ["shoes", "canvas", "casual"], image: "https://loremflickr.com/400/400/canvas,shoes", rating: 4.3, numReviews: 68, stock: 40, views: 120 },
  { name: "Ankle Length Chelsea Boots", description: "Classic leather Chelsea boots with elastic side panel", price: 3299, category: "Footwear", tags: ["shoes", "boots", "chelsea"], image: "https://loremflickr.com/400/400/chelsea,boots", rating: 4.5, numReviews: 52, stock: 22, views: 110 },
  { name: "Football Studs", description: "Firm-ground football studs for grip on turf", price: 1799, category: "Footwear", tags: ["shoes", "football", "sports"], image: "https://loremflickr.com/400/400/football,studs", rating: 4.4, numReviews: 77, stock: 30, views: 130 },
  { name: "Running Sandals", description: "Sport sandals with cushioned sole for outdoor wear", price: 799, category: "Footwear", tags: ["shoes", "sandals", "sports"], image: "https://loremflickr.com/400/400/sandals,sports", rating: 4.2, numReviews: 45, stock: 38, views: 100 },
  { name: "Espadrille Flats", description: "Woven jute-sole espadrille flats for summer", price: 999, category: "Footwear", tags: ["shoes", "espadrille", "women"], image: "https://loremflickr.com/400/400/espadrille,flats", rating: 4.3, numReviews: 39, stock: 26, views: 90 },
  { name: "Winter Snow Boots", description: "Insulated waterproof boots for snowy conditions", price: 2999, category: "Footwear", tags: ["shoes", "boots", "winter"], image: "https://loremflickr.com/400/400/snow,boots", rating: 4.6, numReviews: 41, stock: 18, views: 95 },
  { name: "Ballet Flats", description: "Comfortable slip-on ballet flats for women", price: 899, category: "Footwear", tags: ["shoes", "flats", "women"], image: "https://loremflickr.com/400/400/ballet,flats", rating: 4.4, numReviews: 63, stock: 34, views: 105 },
  { name: "Sports Slides", description: "Adjustable strap sports slides for post-workout comfort", price: 599, category: "Footwear", tags: ["shoes", "slides", "sports"], image: "https://loremflickr.com/400/400/slides,sports", rating: 3.8, numReviews: 88, stock: 50, views: 140 },
  { name: "Derby Formal Shoes", description: "Classic black derby shoes for formal occasions", price: 2599, category: "Footwear", tags: ["shoes", "formal", "men"], image: "https://loremflickr.com/400/400/derby,formal", rating: 4.5, numReviews: 47, stock: 24, views: 100 },
  { name: "Trekking Sandals", description: "Rugged outdoor trekking sandals with grip sole", price: 1299, category: "Footwear", tags: ["shoes", "trekking", "outdoor"], image: "https://loremflickr.com/400/400/trekking,sandals", rating: 4.4, numReviews: 56, stock: 28, views: 110 },

  { name: "Smart LED TV 32-inch", description: "HD smart LED TV with built-in streaming apps", price: 12999, category: "Electronics", tags: ["tv", "electronics", "smart"], image: "https://loremflickr.com/400/400/tv,electronics", rating: 4.5, numReviews: 214, stock: 15, views: 320 },
  { name: "Wireless Charging Pad", description: "10W fast wireless charging pad for smartphones", price: 799, category: "Electronics", tags: ["charger", "wireless", "electronics"], image: "https://loremflickr.com/400/400/charger,wireless", rating: 4.3, numReviews: 132, stock: 60, views: 200 },
  { name: "Digital Photo Frame", description: "10-inch WiFi digital photo frame for sharing memories", price: 3499, category: "Electronics", tags: ["photoframe", "electronics", "digital"], image: "https://loremflickr.com/400/400/photoframe,digital", rating: 4.2, numReviews: 41, stock: 20, views: 90 },
  { name: "Portable SSD 1TB", description: "USB 3.1 portable SSD with fast read/write speeds", price: 6999, category: "Electronics", tags: ["storage", "ssd", "electronics"], image: "https://loremflickr.com/400/400/ssd,storage", rating: 4.7, numReviews: 156, stock: 25, views: 260 },
  { name: "Smart Home Plug", description: "WiFi smart plug compatible with voice assistants", price: 899, category: "Electronics", tags: ["smarthome", "plug", "electronics"], image: "https://loremflickr.com/400/400/smartplug,electronics", rating: 4.3, numReviews: 98, stock: 55, views: 170 },
  { name: "Gaming Headset", description: "Over-ear gaming headset with noise-cancelling mic", price: 1999, category: "Electronics", tags: ["headset", "gaming", "audio"], image: "https://loremflickr.com/400/400/headset,gaming", rating: 4.5, numReviews: 187, stock: 35, views: 250 },
  { name: "Fitness Band", description: "Water-resistant fitness band with heart rate monitor", price: 1499, category: "Electronics", tags: ["fitness", "band", "wearable"], image: "https://loremflickr.com/400/400/fitnessband,wearable", rating: 2.3, numReviews: 201, stock: 45, views: 270 },
  { name: "Bluetooth Car FM Transmitter", description: "Car FM transmitter with Bluetooth and USB charging", price: 699, category: "Electronics", tags: ["car", "bluetooth", "electronics"], image: "https://loremflickr.com/400/400/car,bluetooth", rating: 4.1, numReviews: 64, stock: 40, views: 110 },
  { name: "External Hard Drive 2TB", description: "USB 3.0 external hard drive for backups", price: 5499, category: "Electronics", tags: ["storage", "harddrive", "electronics"], image: "https://loremflickr.com/400/400/harddrive,storage", rating: 4.6, numReviews: 119, stock: 30, views: 190 },
  { name: "Wi-Fi Range Extender", description: "Dual-band WiFi extender for whole-home coverage", price: 1399, category: "Electronics", tags: ["wifi", "router", "electronics"], image: "https://loremflickr.com/400/400/wifi,router", rating: 4.3, numReviews: 87, stock: 42, views: 150 },

  { name: "Men's Cargo Shorts", description: "Multi-pocket cotton cargo shorts for men", price: 899, category: "Clothing", tags: ["shorts", "men", "casual"], image: "https://loremflickr.com/400/400/cargo,shorts", rating: 4.3, numReviews: 72, stock: 45, views: 130 },
  { name: "Women's Palazzo Pants", description: "Flowy wide-leg palazzo pants for women", price: 799, category: "Clothing", tags: ["pants", "women", "casual"], image: "https://loremflickr.com/400/400/palazzo,pants", rating: 4.4, numReviews: 91, stock: 50, views: 150 },
  { name: "Denim Dungaree", description: "Classic denim dungaree overalls", price: 1499, category: "Clothing", tags: ["dungaree", "denim", "women"], image: "https://loremflickr.com/400/400/dungaree,denim", rating: 4.2, numReviews: 38, stock: 22, views: 90 },
  { name: "Men's Formal Blazer", description: "Slim-fit formal blazer for office and events", price: 3499, category: "Clothing", tags: ["blazer", "men", "formal"], image: "https://loremflickr.com/400/400/blazer,formal", rating: 4.6, numReviews: 64, stock: 20, views: 140 },
  { name: "Women's Cardigan", description: "Soft knit cardigan for layering", price: 1199, category: "Clothing", tags: ["cardigan", "women", "winter"], image: "https://loremflickr.com/400/400/cardigan,women", rating: 4.4, numReviews: 57, stock: 30, views: 110 },
  { name: "Nightwear Pajama Set", description: "Cotton pajama set for comfortable sleep", price: 699, category: "Clothing", tags: ["nightwear", "pajama", "sleepwear"], image: "https://loremflickr.com/400/400/pajama,nightwear", rating: 2.7, numReviews: 112, stock: 60, views: 170 },
  { name: "Men's Rain Jacket", description: "Waterproof breathable rain jacket for men", price: 1899, category: "Clothing", tags: ["jacket", "rain", "men"], image: "https://loremflickr.com/400/400/rainjacket,men", rating: 4.3, numReviews: 49, stock: 25, views: 100 },
  { name: "Women's Crop Top", description: "Casual cotton crop top for summer", price: 499, category: "Clothing", tags: ["croptop", "women", "casual"], image: "https://loremflickr.com/400/400/croptop,women", rating: 4.2, numReviews: 83, stock: 55, views: 130 },
  { name: "Men's Vest Innerwear", description: "Pack of 3 cotton vests for daily wear", price: 399, category: "Clothing", tags: ["vest", "innerwear", "men"], image: "https://loremflickr.com/400/400/vest,innerwear", rating: 4.4, numReviews: 96, stock: 70, views: 150 },
  { name: "Kids Winter Sweater", description: "Warm knit sweater for kids", price: 799, category: "Clothing", tags: ["sweater", "kids", "winter"], image: "https://loremflickr.com/400/400/sweater,kids", rating: 4.5, numReviews: 44, stock: 35, views: 100 },

  { name: "Metal Sunglasses Case", description: "Hard-shell metal case for sunglasses protection", price: 349, category: "Accessories", tags: ["case", "sunglasses", "accessory"], image: "https://loremflickr.com/400/400/case,accessory", rating: 4.1, numReviews: 34, stock: 45, views: 80 },
  { name: "Leather Card Holder", description: "Slim leather card holder with multiple slots", price: 449, category: "Accessories", tags: ["wallet", "cardholder", "leather"], image: "https://loremflickr.com/400/400/cardholder,leather", rating: 4.4, numReviews: 79, stock: 55, views: 130 },
  { name: "Fashion Scarf", description: "Lightweight printed fashion scarf for women", price: 399, category: "Accessories", tags: ["scarf", "fashion", "women"], image: "https://loremflickr.com/400/400/scarf,fashion", rating: 4.3, numReviews: 52, stock: 48, views: 100 },
  { name: "Beanie Cap", description: "Warm knit beanie cap for winter", price: 349, category: "Accessories", tags: ["cap", "beanie", "winter"], image: "https://loremflickr.com/400/400/beanie,cap", rating: 4.2, numReviews: 61, stock: 50, views: 105 },
  { name: "Neck Tie Set", description: "Set of 3 formal neckties for men", price: 599, category: "Accessories", tags: ["necktie", "formal", "men"], image: "https://loremflickr.com/400/400/necktie,formal", rating: 3.1, numReviews: 43, stock: 38, views: 90 },
  { name: "Cufflinks Pair", description: "Elegant metal cufflinks for formal shirts", price: 499, category: "Accessories", tags: ["cufflinks", "formal", "men"], image: "https://loremflickr.com/400/400/cufflinks,formal", rating: 4.4, numReviews: 29, stock: 30, views: 75 },
  { name: "Hair Clip Set", description: "Set of 6 assorted hair clips for women", price: 249, category: "Accessories", tags: ["hairclip", "women", "accessory"], image: "https://loremflickr.com/400/400/hairclip,accessory", rating: 4.1, numReviews: 66, stock: 65, views: 110 },
  { name: "Keychain Multi-tool", description: "Compact multi-tool keychain with bottle opener", price: 299, category: "Accessories", tags: ["keychain", "tool", "accessory"], image: "https://loremflickr.com/400/400/keychain,tool", rating: 4.3, numReviews: 58, stock: 60, views: 100 },
  { name: "Phone Lanyard Strap", description: "Adjustable crossbody lanyard strap for phones", price: 249, category: "Accessories", tags: ["lanyard", "phone", "accessory"], image: "https://loremflickr.com/400/400/lanyard,phone", rating: 4.2, numReviews: 37, stock: 50, views: 85 },
  { name: "Travel Duffel Bag", description: "Spacious duffel bag for weekend travel", price: 1799, category: "Accessories", tags: ["bag", "duffel", "travel"], image: "https://loremflickr.com/400/400/duffel,travel", rating: 4.5, numReviews: 74, stock: 28, views: 140 },

  { name: "Non-Stick Tawa", description: "Induction-friendly non-stick tawa for cooking", price: 899, category: "Home & Kitchen", tags: ["kitchen", "tawa", "cookware"], image: "https://loremflickr.com/400/400/tawa,cookware", rating: 4.4, numReviews: 92, stock: 40, views: 140 },
  { name: "Blender Jar Mixer", description: "500W blender with 3 jars for kitchen use", price: 2499, category: "Home & Kitchen", tags: ["kitchen", "blender", "appliance"], image: "https://loremflickr.com/400/400/blender,kitchen", rating: 4.5, numReviews: 143, stock: 26, views: 200 },
  { name: "Microwave Oven 20L", description: "20L solo microwave oven for reheating and defrosting", price: 5999, category: "Home & Kitchen", tags: ["kitchen", "microwave", "appliance"], image: "https://loremflickr.com/400/400/microwave,kitchen", rating: 4.4, numReviews: 108, stock: 14, views: 180 },
  { name: "Water Purifier", description: "RO+UV water purifier for home use", price: 8999, category: "Home & Kitchen", tags: ["kitchen", "waterpurifier", "appliance"], image: "https://loremflickr.com/400/400/waterpurifier,kitchen", rating: 3.4, numReviews: 76, stock: 10, views: 150 },
  { name: "Bedside Table Lamp", description: "Warm-light bedside table lamp with fabric shade", price: 999, category: "Home & Kitchen", tags: ["lamp", "home", "decor"], image: "https://loremflickr.com/400/400/lamp,home", rating: 4.3, numReviews: 55, stock: 35, views: 110 },
  { name: "Kitchen Knife Set", description: "5-piece stainless steel kitchen knife set", price: 1299, category: "Home & Kitchen", tags: ["kitchen", "knife", "cookware"], image: "https://loremflickr.com/400/400/knife,kitchen", rating: 4.5, numReviews: 87, stock: 32, views: 130 },
  { name: "Cutting Board Set", description: "Set of 3 wooden cutting boards", price: 599, category: "Home & Kitchen", tags: ["kitchen", "cuttingboard", "cookware"], image: "https://loremflickr.com/400/400/cuttingboard,kitchen", rating: 4.4, numReviews: 64, stock: 45, views: 105 },
  { name: "Storage Rack Organizer", description: "Multi-tier storage rack for kitchen organization", price: 1499, category: "Home & Kitchen", tags: ["storage", "organizer", "home"], image: "https://loremflickr.com/400/400/storage,organizer", rating: 4.3, numReviews: 49, stock: 30, views: 100 },
  { name: "Curtain Set 2pc", description: "Blackout curtain set of 2 panels", price: 1199, category: "Home & Kitchen", tags: ["curtain", "home", "decor"], image: "https://loremflickr.com/400/400/curtain,home", rating: 4.2, numReviews: 41, stock: 28, views: 90 },
  { name: "Door Mat Set", description: "Set of 2 anti-skid door mats", price: 449, category: "Home & Kitchen", tags: ["doormat", "home", "decor"], image: "https://loremflickr.com/400/400/doormat,home", rating: 4.1, numReviews: 58, stock: 50, views: 100 },

  { name: "Body Lotion 400ml", description: "Deep moisturizing body lotion for all skin types", price: 349, category: "Beauty & Personal Care", tags: ["skincare", "lotion", "beauty"], image: "https://loremflickr.com/400/400/lotion,skincare", rating: 4.4, numReviews: 143, stock: 65, views: 190 },
  { name: "Shampoo 650ml", description: "Nourishing shampoo for smooth and shiny hair", price: 399, category: "Beauty & Personal Care", tags: ["haircare", "shampoo", "beauty"], image: "https://loremflickr.com/400/400/shampoo,haircare", rating: 4.5, numReviews: 187, stock: 70, views: 220 },
  { name: "Face Wash Gel", description: "Oil-control face wash gel for daily cleansing", price: 249, category: "Beauty & Personal Care", tags: ["skincare", "facewash", "beauty"], image: "https://loremflickr.com/400/400/facewash,skincare", rating: 3.6, numReviews: 121, stock: 60, views: 170 },
  { name: "Hair Serum", description: "Anti-frizz hair serum for smooth finish", price: 449, category: "Beauty & Personal Care", tags: ["haircare", "serum", "beauty"], image: "https://loremflickr.com/400/400/serum,haircare", rating: 4.4, numReviews: 76, stock: 45, views: 130 },
  { name: "Deodorant Spray", description: "Long-lasting deodorant spray for men and women", price: 299, category: "Beauty & Personal Care", tags: ["deodorant", "grooming", "beauty"], image: "https://loremflickr.com/400/400/deodorant,grooming", rating: 4.2, numReviews: 98, stock: 80, views: 150 },
  { name: "Makeup Brush Set", description: "12-piece professional makeup brush set", price: 799, category: "Beauty & Personal Care", tags: ["makeup", "brush", "beauty"], image: "https://loremflickr.com/400/400/makeup,brush", rating: 4.6, numReviews: 112, stock: 38, views: 160 },
  { name: "Facial Cleansing Roller", description: "Jade facial roller for skin massage and glow", price: 399, category: "Beauty & Personal Care", tags: ["skincare", "roller", "beauty"], image: "https://loremflickr.com/400/400/roller,skincare", rating: 4.3, numReviews: 54, stock: 32, views: 110 },
  { name: "Aloe Vera Gel", description: "Pure aloe vera gel for skin and hair", price: 199, category: "Beauty & Personal Care", tags: ["skincare", "aloevera", "beauty"], image: "https://loremflickr.com/400/400/aloevera,skincare", rating: 4.5, numReviews: 167, stock: 75, views: 200 },
  { name: "Herbal Soap Pack", description: "Pack of 4 herbal bathing soaps", price: 249, category: "Beauty & Personal Care", tags: ["soap", "herbal", "beauty"], image: "https://loremflickr.com/400/400/soap,herbal", rating: 4.2, numReviews: 88, stock: 90, views: 140 },
  { name: "Compact Powder", description: "Matte finish compact powder for face makeup", price: 349, category: "Beauty & Personal Care", tags: ["makeup", "compact", "beauty"], image: "https://loremflickr.com/400/400/compact,makeup", rating: 4.3, numReviews: 71, stock: 42, views: 120 },

  { name: "The Subtle Art of Not Giving a F*ck", description: "A counterintuitive approach to living a good life", price: 349, category: "Books", tags: ["book", "self-help", "bestseller"], image: "https://loremflickr.com/400/400/book,selfhelp", rating: 4.5, numReviews: 267, stock: 60, views: 240 },
  { name: "Think and Grow Rich", description: "Classic personal development and wealth-building book", price: 299, category: "Books", tags: ["book", "self-help", "finance"], image: "https://loremflickr.com/400/400/book,finance", rating: 3.8, numReviews: 198, stock: 55, views: 210 },
  { name: "To Kill a Mockingbird", description: "Pulitzer Prize-winning classic novel", price: 399, category: "Books", tags: ["book", "fiction", "classic"], image: "https://loremflickr.com/400/400/book,classic", rating: 4.7, numReviews: 234, stock: 48, views: 220 },
  { name: "1984", description: "George Orwell's dystopian classic novel", price: 349, category: "Books", tags: ["book", "fiction", "classic"], image: "https://loremflickr.com/400/400/book,dystopian", rating: 4.8, numReviews: 289, stock: 52, views: 250 },
  { name: "The Great Gatsby", description: "F. Scott Fitzgerald's timeless classic novel", price: 299, category: "Books", tags: ["book", "fiction", "classic"], image: "https://loremflickr.com/400/400/book,gatsby", rating: 4.5, numReviews: 176, stock: 44, views: 190 },
  { name: "Wings of Fire", description: "Autobiography of Dr. A.P.J. Abdul Kalam", price: 349, category: "Books", tags: ["book", "biography", "inspiration"], image: "https://loremflickr.com/400/400/book,biography", rating: 4.7, numReviews: 221, stock: 58, views: 230 },
  { name: "The Power of Habit", description: "Why we do what we do and how to change it", price: 399, category: "Books", tags: ["book", "self-help", "psychology"], image: "https://loremflickr.com/400/400/book,psychology", rating: 4.5, numReviews: 154, stock: 40, views: 180 },
  { name: "Charlie and the Chocolate Factory", description: "Roald Dahl's beloved children's classic", price: 299, category: "Books", tags: ["book", "fiction", "kids"], image: "https://loremflickr.com/400/400/book,kids", rating: 4.6, numReviews: 143, stock: 50, views: 170 },
  { name: "The Hobbit", description: "J.R.R. Tolkien's classic fantasy adventure", price: 449, category: "Books", tags: ["book", "fiction", "fantasy"], image: "https://loremflickr.com/400/400/book,tolkien", rating: 4.8, numReviews: 312, stock: 62, views: 280 },
  { name: "Zero to One", description: "Notes on startups and building the future", price: 399, category: "Books", tags: ["book", "business", "startup"], image: "https://loremflickr.com/400/400/book,startup", rating: 4.5, numReviews: 132, stock: 36, views: 160 },

  { name: "Foam Roller", description: "High-density foam roller for muscle recovery", price: 799, category: "Sports & Fitness", tags: ["fitness", "recovery", "foamroller"], image: "https://loremflickr.com/400/400/foamroller,fitness", rating: 2.3, numReviews: 62, stock: 35, views: 110 },
  { name: "Ankle Weights Pair", description: "Adjustable ankle weights for strength training", price: 599, category: "Sports & Fitness", tags: ["fitness", "weights", "strength"], image: "https://loremflickr.com/400/400/ankleweights,fitness", rating: 4.2, numReviews: 47, stock: 40, views: 95 },
  { name: "Jump Rope Speed", description: "Adjustable speed jump rope for cardio training", price: 349, category: "Sports & Fitness", tags: ["fitness", "rope", "cardio"], image: "https://loremflickr.com/400/400/jumprope,fitness", rating: 4.3, numReviews: 88, stock: 55, views: 130 },
  { name: "Skateboard", description: "Maple deck skateboard for beginners and pros", price: 2499, category: "Sports & Fitness", tags: ["sports", "skateboard", "outdoor"], image: "https://loremflickr.com/400/400/skateboard,sports", rating: 4.5, numReviews: 79, stock: 20, views: 150 },
  { name: "Cricket Helmet", description: "Protective cricket helmet with adjustable fit", price: 1499, category: "Sports & Fitness", tags: ["cricket", "helmet", "sports"], image: "https://loremflickr.com/400/400/cricket,helmet", rating: 4.4, numReviews: 53, stock: 25, views: 105 },
  { name: "Football Boots", description: "Studded football boots for firm ground play", price: 1999, category: "Sports & Fitness", tags: ["football", "boots", "sports"], image: "https://loremflickr.com/400/400/football,boots", rating: 4.5, numReviews: 91, stock: 28, views: 140 },
  { name: "Fitness Tracker Band", description: "Slim fitness tracker with step and sleep tracking", price: 1299, category: "Sports & Fitness", tags: ["fitness", "tracker", "wearable"], image: "https://loremflickr.com/400/400/tracker,fitness", rating: 4.3, numReviews: 134, stock: 42, views: 190 },
  { name: "Gym Bag", description: "Spacious gym duffel bag with shoe compartment", price: 999, category: "Sports & Fitness", tags: ["gym", "bag", "fitness"], image: "https://loremflickr.com/400/400/gymbag,fitness", rating: 4.4, numReviews: 68, stock: 34, views: 120 },
  { name: "Swimming Goggles", description: "Anti-fog swimming goggles with UV protection", price: 499, category: "Sports & Fitness", tags: ["swimming", "goggles", "sports"], image: "https://loremflickr.com/400/400/goggles,swimming", rating: 4.3, numReviews: 57, stock: 45, views: 100 },
  { name: "Boxing Gloves", description: "Padded boxing gloves for training and sparring", price: 1599, category: "Sports & Fitness", tags: ["boxing", "gloves", "fitness"], image: "https://loremflickr.com/400/400/boxing,gloves", rating: 2.7, numReviews: 82, stock: 30, views: 145 },

  { name: "Board Game Ludo Set", description: "Classic wooden ludo board game for family fun", price: 599, category: "Toys & Games", tags: ["toy", "boardgame", "family"], image: "https://loremflickr.com/400/400/ludo,boardgame", rating: 4.5, numReviews: 94, stock: 40, views: 130 },
  { name: "RC Helicopter", description: "Remote-controlled helicopter with gyro stabilization", price: 1999, category: "Toys & Games", tags: ["toy", "rc", "helicopter"], image: "https://loremflickr.com/400/400/rc,helicopter", rating: 4.3, numReviews: 61, stock: 22, views: 120 },
  { name: "Building Bricks Mega Set", description: "500-piece building bricks set for creative play", price: 1499, category: "Toys & Games", tags: ["toy", "bricks", "kids"], image: "https://loremflickr.com/400/400/bricks,toy", rating: 4.6, numReviews: 118, stock: 30, views: 160 },
  { name: "Toy Kitchen Set", description: "Pretend-play toy kitchen set with utensils", price: 1299, category: "Toys & Games", tags: ["toy", "kitchen", "kids"], image: "https://loremflickr.com/400/400/toykitchen,kids", rating: 4.5, numReviews: 76, stock: 25, views: 130 },
  { name: "Musical Keyboard Toy", description: "Mini electronic keyboard toy for kids", price: 899, category: "Toys & Games", tags: ["toy", "musical", "kids"], image: "https://loremflickr.com/400/400/keyboard,toy", rating: 4.2, numReviews: 49, stock: 35, views: 100 },
  { name: "Action Figure Set", description: "Set of 5 collectible action figures", price: 799, category: "Toys & Games", tags: ["toy", "actionfigure", "kids"], image: "https://loremflickr.com/400/400/actionfigure,toy", rating: 4.4, numReviews: 87, stock: 38, views: 125 },
  { name: "Toy Race Track", description: "Loop race track set with two race cars", price: 1199, category: "Toys & Games", tags: ["toy", "racetrack", "kids"], image: "https://loremflickr.com/400/400/racetrack,toy", rating: 4.3, numReviews: 55, stock: 28, views: 110 },
  { name: "Water Gun", description: "High-capacity water gun for outdoor summer fun", price: 349, category: "Toys & Games", tags: ["toy", "watergun", "outdoor"], image: "https://loremflickr.com/400/400/watergun,toy", rating: 4.1, numReviews: 63, stock: 50, views: 105 },
  { name: "Magic Trick Kit", description: "Beginner magic trick kit with instruction guide", price: 699, category: "Toys & Games", tags: ["toy", "magic", "kids"], image: "https://loremflickr.com/400/400/magic,toy", rating: 3.1, numReviews: 41, stock: 24, views: 90 },
  { name: "Stuffed Animal Elephant", description: "Soft plush stuffed elephant toy", price: 599, category: "Toys & Games", tags: ["toy", "plush", "kids"], image: "https://loremflickr.com/400/400/plush,elephant", rating: 4.6, numReviews: 102, stock: 45, views: 150 },

  { name: "Peanut Butter Jar", description: "Creamy peanut butter, high in protein", price: 349, category: "Grocery & Gourmet", tags: ["grocery", "peanutbutter", "healthy"], image: "https://loremflickr.com/400/400/peanutbutter,grocery", rating: 4.5, numReviews: 176, stock: 80, views: 210 },
  { name: "Cornflakes 500g", description: "Crunchy breakfast cornflakes cereal", price: 249, category: "Grocery & Gourmet", tags: ["grocery", "cereal", "breakfast"], image: "https://loremflickr.com/400/400/cornflakes,grocery", rating: 4.3, numReviews: 98, stock: 90, views: 160 },
  { name: "Instant Coffee Jar", description: "Rich and aromatic instant coffee powder", price: 299, category: "Grocery & Gourmet", tags: ["grocery", "coffee", "beverage"], image: "https://loremflickr.com/400/400/coffee,grocery", rating: 4.6, numReviews: 213, stock: 100, views: 250 },
  { name: "Pasta 500g", description: "Durum wheat pasta, perfect for Italian dishes", price: 149, category: "Grocery & Gourmet", tags: ["grocery", "pasta", "staple"], image: "https://loremflickr.com/400/400/pasta,grocery", rating: 4.4, numReviews: 87, stock: 95, views: 140 },
  { name: "Mixed Dry Fruits 500g", description: "Premium mix of almonds, cashews, and raisins", price: 799, category: "Grocery & Gourmet", tags: ["grocery", "dryfruits", "healthy"], image: "https://loremflickr.com/400/400/dryfruits,grocery", rating: 4.7, numReviews: 154, stock: 60, views: 200 },
  { name: "Herbal Tea Box", description: "Box of 25 assorted herbal tea bags", price: 349, category: "Grocery & Gourmet", tags: ["grocery", "tea", "beverage"], image: "https://loremflickr.com/400/400/herbaltea,grocery", rating: 4.4, numReviews: 76, stock: 70, views: 130 },
  { name: "Cooking Oil 1L", description: "Refined sunflower cooking oil", price: 199, category: "Grocery & Gourmet", tags: ["grocery", "oil", "staple"], image: "https://loremflickr.com/400/400/cookingoil,grocery", rating: 4.3, numReviews: 112, stock: 85, views: 150 },
  { name: "Whole Wheat Flour 5kg", description: "Stone-ground whole wheat flour", price: 349, category: "Grocery & Gourmet", tags: ["grocery", "flour", "staple"], image: "https://loremflickr.com/400/400/flour,grocery", rating: 3.4, numReviews: 143, stock: 100, views: 190 },
  { name: "Protein Bar Pack", description: "Pack of 6 high-protein snack bars", price: 599, category: "Grocery & Gourmet", tags: ["grocery", "protein", "snacks"], image: "https://loremflickr.com/400/400/proteinbar,grocery", rating: 4.4, numReviews: 121, stock: 65, views: 170 },
  { name: "Masala Spice Box", description: "Traditional stainless steel masala spice box with 7 compartments", price: 449, category: "Grocery & Gourmet", tags: ["grocery", "spices", "kitchen"], image: "https://loremflickr.com/400/400/spices,grocery", rating: 4.6, numReviews: 98, stock: 55, views: 150 },
];

const seed = async () => {
  await connectDB();

  await Product.deleteMany();
  await User.deleteMany();
  await Category.deleteMany();
  await Brand.deleteMany();
  await Review.deleteMany();

  // insertMany() skips Mongoose 'save' hooks, so fetch each product's real,
  // name-matching photo explicitly here (see utils/imageMatcher.js — it
  // looks up a hand-verified photo first, then does a live, key-less search
  // using the product's own name so the image always matches). If there is
  // no internet access at seed time, it safely falls back to the generated
  // on-brand card so seeding never fails or shows a blank/wrong image.
  const { getRealProductImage, resetUsedImages } = require("../utils/imageMatcher");
  resetUsedImages();

  // Fetch images in small BATCHES (a few products at once, not all 200,
  // and not fully one-by-one either) — this keeps things fast while still
  // avoiding the rate-limiting that happens when 200 requests fire at the
  // exact same instant. A progress line is printed after every product so
  // the terminal never looks "stuck" during this step.
  const BATCH_SIZE = 8;
  const productsWithImages = new Array(products.length);
  let completed = 0;

  for (let start = 0; start < products.length; start += BATCH_SIZE) {
    const batch = products.slice(start, start + BATCH_SIZE);
    await Promise.all(
      batch.map(async (p, offset) => {
        const i = start + offset;
        const enriched = { ...p, image: await getRealProductImage(p.name, p.category) };
        if (i % 3 === 0) {
          const markupFactor = 1.15 + ((i % 5) * 0.1); // between 1.15x and 1.55x
          enriched.originalPrice = Math.round((p.price * markupFactor) / 10) * 10;
        }
        productsWithImages[i] = enriched;
        completed += 1;
        console.log(`   [${completed}/${products.length}] ${p.name}`);
      })
    );
  }

  console.log("🖼️  All product images fetched, saving to database...");

  await Product.insertMany(productsWithImages);

  await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "Admin@123",
    role: "admin",
  });

  const testUser = await User.create({
    name: "Test User",
    email: "user@example.com",
    password: "User@1234",
    role: "user",
  });

  await Category.insertMany([
    { name: "Footwear", icon: "👟", description: "Shoes, sneakers, boots and sandals" },
    { name: "Electronics", icon: "🎧", description: "Gadgets, audio and computer accessories" },
    { name: "Clothing", icon: "👕", description: "Everyday and formal wear" },
    { name: "Accessories", icon: "🎒", description: "Bags, watches, eyewear and more" },
    { name: "Home & Kitchen", icon: "🏠", description: "Cookware, appliances and home decor" },
    { name: "Beauty & Personal Care", icon: "💄", description: "Skincare, haircare and grooming" },
    { name: "Books", icon: "📚", description: "Fiction, non-fiction and stationery" },
    { name: "Sports & Fitness", icon: "🏋️", description: "Gym, outdoor and fitness gear" },
    { name: "Toys & Games", icon: "🧸", description: "Toys, board games and puzzles" },
    { name: "Grocery & Gourmet", icon: "🍯", description: "Snacks, beverages and pantry staples" },
  ]);

  await Brand.insertMany([
    { name: "ShopAI Essentials" },
    { name: "UrbanStride" },
    { name: "NovaTech" },
    { name: "PureGlow" },
  ]);

  // NOTE: No demo/fake reviews are seeded here on purpose — the Reviews
  // panel should only ever show reviews that real, logged-in customers
  // submit from a product page.

  console.log("✅ Seed data inserted successfully!");
  console.log("   Admin login  -> admin@example.com / Admin@123");
  console.log("   User login   -> user@example.com / User@1234");
  mongoose.connection.close();
};

seed().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});
