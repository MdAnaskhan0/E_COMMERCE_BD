import { useSelector } from 'react-redux';
const D = {
  home: ['Home', 'হোম'], shop: ['Shop', 'দোকান'], cart: ['Cart', 'কার্ট'], track: ['Track Order', 'অর্ডার ট্র্যাক'], login: ['Sign In', 'সাইন ইন'],
  register: ['Sign Up', 'সাইন আপ'], logout: ['Logout', 'লগআউট'], dashboard: ['My Dashboard', 'আমার ড্যাশবোর্ড'], admin: ['Admin Panel', 'অ্যাডমিন প্যানেল'],
  search: ['Search products...', 'পণ্য খুঁজুন...'], featured: ['Featured Products', 'ফিচার্ড পণ্য'], best: ['Best Selling', 'বেস্ট সেলিং'], categories: ['Categories', 'ক্যাটেগরি'],
  addCart: ['Add to Cart', 'কার্টে যোগ করুন'], buyNow: ['Buy Now', 'এখনই কিনুন'], outStock: ['Out of stock', 'স্টক নেই'], inStock: ['In stock', 'স্টকে আছে'],
  details: ['Details', 'বিবরণ'], features: ['Features', 'বৈশিষ্ট্য'], reviews: ['Reviews', 'রিভিউ'], bulk: ['Bulk price', 'পরিমাণ অনুযায়ী দাম'], qty: ['Quantity', 'পরিমাণ'],
  emptyCart: ['Your cart is empty', 'আপনার কার্ট খালি'], subtotal: ['Subtotal', 'সাবটোটাল'], discount: ['Discount', 'ছাড়'], shipping: ['Shipping', 'ডেলিভারি চার্জ'], total: ['Total', 'মোট'],
  checkout: ['Checkout', 'চেকআউট'], placeOrder: ['Place Order', 'অর্ডার করুন'], name: ['Full name', 'পুরো নাম'], phone: ['Phone', 'ফোন নম্বর'], email: ['Email', 'ইমেইল'],
  address: ['Address', 'ঠিকানা'], city: ['City', 'শহর'], note: ['Note (optional)', 'নোট (ঐচ্ছিক)'], payment: ['Payment method', 'পেমেন্ট মেথড'], cod: ['Cash on Delivery', 'ক্যাশ অন ডেলিভারি'],
  coupon: ['Coupon code', 'কুপন কোড'], apply: ['Apply', 'প্রয়োগ'], guestInfo: ['Order as guest, or sign in for faster checkout.', 'গেস্ট হিসেবে অর্ডার করুন, অথবা সাইন ইন করুন।'],
  orderDone: ['Order placed successfully!', 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!'], orderNo: ['Order number', 'অর্ডার নম্বর'], password: ['Password', 'পাসওয়ার্ড'],
  orders: ['My Orders', 'আমার অর্ডার'], addresses: ['Addresses', 'ঠিকানাসমূহ'], profile: ['Profile', 'প্রোফাইল'], save: ['Save', 'সংরক্ষণ'], add: ['Add', 'যোগ করুন'],
  delete: ['Delete', 'মুছুন'], status: ['Status', 'স্ট্যাটাস'], all: ['All', 'সব'], sortNew: ['Newest', 'নতুন'], sortLow: ['Price: low to high', 'দাম: কম থেকে বেশি'], sortHigh: ['Price: high to low', 'দাম: বেশি থেকে কম'],
  heroTitle: ['Everything you need, delivered to your door', 'আপনার প্রয়োজনীয় সবকিছু, পৌঁছে যাবে দরজায়'], heroSub: ['Quality products at honest prices across Bangladesh.', 'সারা বাংলাদেশে সঠিক দামে মানসম্মত পণ্য।'],
  shopNow: ['Shop Now', 'কেনাকাটা করুন'], noResult: ['No products found', 'কোনো পণ্য পাওয়া যায়নি'], writeReview: ['Write a review', 'রিভিউ লিখুন'], submit: ['Submit', 'জমা দিন'],
  haveAccount: ['Already have an account?', 'আগে থেকেই অ্যাকাউন্ট আছে?'], noAccount: ['New here?', 'নতুন?'], trxId: ['Transaction ID', 'ট্রানজ্যাকশন আইডি'],
  viewAll: ['View all', 'সব দেখুন'], fastDel: ['Fast Delivery', 'দ্রুত ডেলিভারি'], fastDelS: ['All over Bangladesh', 'সারা বাংলাদেশে'], securePay: ['Secure Payment', 'নিরাপদ পেমেন্ট'], securePayS: ['COD, bKash & Nagad', 'ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ'],
  genuine: ['100% Genuine', '১০০% আসল পণ্য'], genuineS: ['Quality guaranteed', 'মানের নিশ্চয়তা'], support: ['Friendly Support', 'আন্তরিক সাপোর্ট'], supportS: ['We are here to help', 'আমরা আছি আপনার পাশে'],
  quickLinks: ['Quick Links', 'দ্রুত লিংক'], contact: ['Contact', 'যোগাযোগ'], follow: ['Follow us', 'আমাদের অনুসরণ করুন'], hello: ['Hello', 'স্বাগতম'], welcomeBack: ['Welcome back', 'আবার স্বাগতম'], createAcc: ['Create your account', 'অ্যাকাউন্ট তৈরি করুন'],
  trustLine: ['Trusted by thousands of happy customers', 'হাজারো সন্তুষ্ট গ্রাহকের আস্থা'], ordersLbl: ['Orders', 'অর্ডার'], sale: ['Sale', 'অফার'], addedCart: ['Added to cart', 'কার্টে যোগ হয়েছে'],
  filters: ['Filters', 'ফিল্টার'], priceRange: ['Price range', 'দামের সীমা'], min: ['Min', 'সর্বনিম্ন'], max: ['Max', 'সর্বোচ্চ'], clearAll: ['Clear all', 'সব মুছুন'], inStockOnly: ['In stock only', 'শুধু স্টকে আছে'],
  productsWord: ['products', 'টি পণ্য'], allCats: ['All categories', 'সব ক্যাটেগরি'], sendMoney: ['Send money to this number', 'এই নম্বরে সেন্ড মানি করুন'], amountToPay: ['Amount to pay', 'পরিশোধযোগ্য টাকা'],
  enterTrx: ['Enter Transaction ID', 'ট্রানজ্যাকশন আইডি দিন'], confirmOrder: ['Confirm Order', 'অর্ডার কনফার্ম করুন'], copied: ['Copied!', 'কপি হয়েছে!'], cancel: ['Cancel', 'বাতিল'],
  trxHelp: ['Our team will verify your payment using this ID.', 'এই আইডি দিয়ে আমাদের টিম আপনার পেমেন্ট যাচাই করবে।'], orderSummary: ['Order summary', 'অর্ডার সামারি'], deliveryInfo: ['Delivery information', 'ডেলিভারি তথ্য'],
  step1: ['Open your {m} app and choose "Send Money"', 'আপনার {m} অ্যাপ খুলে "সেন্ড মানি" সিলেক্ট করুন'], step2: ['Send the exact amount to the number above', 'উপরের নম্বরে ঠিক এই পরিমাণ টাকা পাঠান'], step3: ['Copy the Transaction ID from the confirmation message and paste below', 'কনফার্মেশন মেসেজ থেকে ট্রানজ্যাকশন আইডি কপি করে নিচে দিন'],
  noPayNumber: ['Payment number is not set yet. Please choose another method.', 'পেমেন্ট নম্বর এখনো সেট করা হয়নি। অন্য মেথড বেছে নিন।'], savings: ['You save', 'আপনি বাঁচাচ্ছেন'], related: ['Related products', 'সম্পর্কিত পণ্য'], brand: ['Brand', 'ব্র্যান্ড'],
  trackHint: ['Enter your order number to see the live status', 'লাইভ স্ট্যাটাস দেখতে আপনার অর্ডার নম্বর দিন'], onlyWord: ['Only', 'মাত্র'], leftWord: ['left', 'টি বাকি'], account: ['Account', 'অ্যাকাউন্ট'], tryAgain: ['Clear filters', 'ফিল্টার মুছুন'],
  deliveryNote: ['Delivery in 2-4 working days', '২-৪ কার্যদিবসে ডেলিভারি'], easyReturn: ['Easy return policy', 'সহজ রিটার্ন পলিসি'], payHow: ['Payment method', 'পেমেন্ট মেথড'], bkashName: ['bKash', 'বিকাশ'], nagadName: ['Nagad', 'নগদ'], codS: ['Pay when you receive', 'পণ্য হাতে পেয়ে টাকা দিন'], mobS: ['Pay now by mobile', 'এখনই মোবাইলে পরিশোধ করুন'],
};
export const STATUS = { pending: ['Pending', 'পেন্ডিং'], confirmed: ['Confirmed', 'কনফার্মড'], processing: ['Processing', 'প্রসেসিং'], shipped: ['Shipped', 'শিপড'], delivered: ['Delivered', 'ডেলিভারড'], cancelled: ['Cancelled', 'বাতিল'] };
export const useT = () => {
  const lang = useSelector((s) => s.ui.lang);
  const i = lang === 'bn' ? 1 : 0;
  return { lang, t: (k) => D[k]?.[i] ?? k, st: (s) => STATUS[s]?.[i] ?? s, pick: (o, f) => (lang === 'bn' && o[`${f}_bn`]) || o[`${f}_en`],
    money: (n) => '৳' + Number(n).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US') };
};
