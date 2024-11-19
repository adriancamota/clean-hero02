// @ts-nocheck
'use client'
import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Menu, Coins, Leaf, Search, Bell, User, ChevronDown, LogIn, LogOut, MapPin, Trash2, ChevronRight, Loader } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Web3Auth } from "@web3auth/modal"
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { createUser, getUnreadNotifications, markNotificationAsRead, getUserByEmail, getUserBalance } from "@/utils/db/actions"
import debounce from 'lodash/debounce'

const clientId = "BJKdDFkNtkWX87XqkuWrDu4rbkSvWyQZ5lswS0ucINxxcN0inRVW8zzKAywPPzgiOHP7_3PcfFwfpvcQvSdaLRs";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET, // Changed from SAPPHIRE_MAINNET to TESTNET
  privateKeyProvider,
});

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'navigation';
  url: string;
}

export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [balance, setBalance] = useState(0)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const [searchError, setSearchError] = useState<string | null>(null);

  console.log('user info', userInfo);
  
  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
          const user = await web3auth.getUserInfo();
          setUserInfo(user);
          if (user.email) {
            localStorage.setItem('userEmail', user.email);
            document.cookie = `userEmail=${user.email}; path=/`;
            
            try {
              const dbUser = await createUser(user.email, user.name || 'Anonymous User');
              if (dbUser?.isAdmin) {
                window.location.href = '/admin';
              }
            } catch (error) {
              console.error("Error creating user:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const unreadNotifications = await getUnreadNotifications(user.id);
          setNotifications(unreadNotifications);
        }
      }
    };

    fetchNotifications();

    // Set up periodic checking for new notifications
    const notificationInterval = setInterval(fetchNotifications, 30000); // Check every 30 seconds

    return () => clearInterval(notificationInterval);
  }, [userInfo]);

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (userInfo && userInfo.email) {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const userBalance = await getUserBalance(user.id);
          setBalance(userBalance);
        }
      }
    };

    fetchUserBalance();

    // Add an event listener for balance updates
    const handleBalanceUpdate = (event: CustomEvent) => {
      setBalance(event.detail);
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate as EventListener);

    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate as EventListener);
    };
  }, [userInfo]);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setLoggedIn(true);
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem('userEmail', user.email);
        document.cookie = `userEmail=${user.email}; path=/`;
        
        try {
          const dbUser = await createUser(user.email, user.name || 'Anonymous User');
          if (dbUser?.isAdmin) {
            window.location.href = '/admin';
          }
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      setUserInfo(null);
      localStorage.removeItem('userEmail');
      document.cookie = 'userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Dispatch logout event
      window.dispatchEvent(new Event('logout'));
      
      window.location.href = '/';
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getUserInfo = async () => {
    if (web3auth.connected) {
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem('userEmail', user.email);
        try {
          await createUser(user.email, user.name || 'Anonymous User');
        } catch (error) {
          console.error("Error creating user:", error);
          // Handle the error appropriately, maybe show a message to the user
        }
      }
    }
  };

  const handleNotificationClick = async (notificationId: number) => {
    await markNotificationAsRead(notificationId);
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to perform search');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce the search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((query: string) => performSearch(query), 300),
    []
  );

  // Update the search results when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Handle search result selection
  const handleSearchResultClick = (result: SearchResult) => {
    router.push(result.url);
    setSearchQuery('');
    setSearchResults([]);
  };

  if (loading) {
    return <div>Loading Web3Auth...</div>;
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-2 md:mr-4 dark:text-gray-300" onClick={onMenuClick}>
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <div className="flex items-center">
            <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2" />
            <div className="flex flex-col">
              <span className="font-bold text-base md:text-lg text-gray-800 dark:text-gray-100">Clean Hero</span>
            </div>
          </div>
        </div>
        {!isMobile && (
          <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search pages..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-gray-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchResults.length > 0) {
                    handleSearchResultClick(searchResults[0]);
                  }
                }}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              
              {/* Search Results Dropdown */}
              {searchQuery && (
                <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <Loader className="animate-spin h-5 w-5 mx-auto mb-2" />
                      Searching...
                    </div>
                  ) : searchError ? (
                    <div className="p-4 text-center text-red-500">
                      {searchError}
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <button
                        key={result.id}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                        onClick={() => handleSearchResultClick(result)}
                      >
                        <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium">{result.title}</div>
                          <div className="text-sm text-gray-500">
                            Navigation
                          </div>
                        </div>
                      </button>
                    ))
                  ) : searchQuery.trim() !== '' ? (
                    <div className="p-4 text-center text-gray-500">
                      No pages found
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-2 dark:text-gray-300">
              <Search className="h-5 w-5" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{notification.type}</span>
                      <span className="text-sm text-gray-500">{notification.message}</span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="mr-2 md:mr-4 flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-2 md:px-3 py-1">
            <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-green-500" />
            <span className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-200">
              {balance.toFixed(2)}
            </span>
          </div>
          {!loggedIn ? (
            <Button onClick={login} className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base">
              Login
              <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex items-center dark:text-gray-300">
                  <User className="h-5 w-5 mr-1" />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                <DropdownMenuItem className="dark:text-gray-300 dark:focus:bg-gray-700">
                  {userInfo ? userInfo.name : "Fetch User Info"}
                </DropdownMenuItem>
                <DropdownMenuItem className="dark:text-gray-300 dark:focus:bg-gray-700" onClick={logout}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}