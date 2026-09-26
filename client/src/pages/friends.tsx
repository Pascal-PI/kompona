import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserPlus, UserCheck, UserX, Search, Crown, User as UserIcon } from 'lucide-react';

type Friend = {
  friendshipId: string;
  id: string;
  username: string;
  avatarUrl: string | null;
  rating: number;
  membershipTier: string;
};

type FriendRequest = {
  friendshipId: string;
  id: string;
  username: string;
  avatarUrl: string | null;
  rating: number;
  createdAt: string | null;
};

type SearchResult = {
  id: string;
  username: string;
  avatarUrl: string | null;
  rating: number;
};

function Avatar({ url, name, size = 'w-10 h-10' }: { url: string | null; name: string; size?: string }) {
  return (
    <div className={`${size} rounded-full bg-chess-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {url ? (
        <img src={url} alt={`${name}'s avatar`} className="w-full h-full object-cover" />
      ) : (
        <UserIcon className="w-1/2 h-1/2 text-chess-primary" />
      )}
    </div>
  );
}

export default function Friends() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const friendsQuery = useQuery<{ friends: Friend[] }>({ queryKey: ['/api/friends'] });
  const requestsQuery = useQuery<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>({
    queryKey: ['/api/friends/requests'],
  });

  const debouncedSearch = search.trim();
  const searchQuery = useQuery<{ users: SearchResult[] }>({
    queryKey: ['/api/users/search', debouncedSearch],
    queryFn: async () => {
      if (debouncedSearch.length < 2) return { users: [] };
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedSearch)}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: debouncedSearch.length >= 2,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
    queryClient.invalidateQueries({ queryKey: ['/api/friends/requests'] });
    queryClient.invalidateQueries({ queryKey: ['/api/users/search', debouncedSearch] });
  };

  const sendRequest = useMutation({
    mutationFn: async (addresseeId: string) => apiRequest('/api/friends/request', {
      method: 'POST', body: JSON.stringify({ addresseeId }),
    }),
    onSuccess: () => {
      toast({ title: 'Friend request sent' });
      invalidateAll();
    },
    onError: (e: Error) => toast({ title: 'Could not send request', description: e.message, variant: 'destructive' }),
  });

  const acceptRequest = useMutation({
    mutationFn: async (requestId: string) => apiRequest(`/api/friends/accept/${requestId}`, { method: 'POST' }),
    onSuccess: () => {
      toast({ title: 'Friend added!' });
      invalidateAll();
    },
    onError: (e: Error) => toast({ title: 'Could not accept', description: e.message, variant: 'destructive' }),
  });

  const removeRequest = useMutation({
    mutationFn: async (requestId: string) => apiRequest(`/api/friends/request/${requestId}`, { method: 'DELETE' }),
    onSuccess: () => invalidateAll(),
    onError: (e: Error) => toast({ title: 'Could not remove', description: e.message, variant: 'destructive' }),
  });

  const removeFriend = useMutation({
    mutationFn: async (friendId: string) => apiRequest(`/api/friends/${friendId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: 'Friend removed' });
      invalidateAll();
    },
    onError: (e: Error) => toast({ title: 'Could not remove', description: e.message, variant: 'destructive' }),
  });

  const friends = friendsQuery.data?.friends ?? [];
  const incoming = requestsQuery.data?.incoming ?? [];
  const outgoing = requestsQuery.data?.outgoing ?? [];
  const friendIds = new Set(friends.map(f => f.id));
  const outgoingIds = new Set(outgoing.map(o => o.id));
  const incomingIds = new Set(incoming.map(i => i.id));

  return (
    <div className="app-shell min-h-[100dvh] bg-chess-bg font-nunito text-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-chess-secondary flex items-center gap-3">
            <Users className="w-8 h-8 text-chess-primary" />
            Friends
          </h1>
          <p className="text-gray-300 font-roboto">Connect with other players</p>
        </header>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-chess-secondary/20">
            <TabsTrigger value="friends" data-testid="tab-friends">
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              Requests {incoming.length > 0 && <Badge className="ml-2 bg-red-500">{incoming.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="find" data-testid="tab-find">
              Find People
            </TabsTrigger>
          </TabsList>

          {/* Friends list */}
          <TabsContent value="friends" className="mt-4">
            <Card className="bg-chess-secondary/20 border-chess-secondary/30">
              <CardHeader>
                <CardTitle className="text-chess-secondary">Your Friends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {friendsQuery.isLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                ) : friends.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No friends yet. Find people to add!</p>
                  </div>
                ) : (
                  friends.map(f => (
                    <div
                      key={f.friendshipId}
                      className="flex items-center justify-between p-3 rounded-lg bg-chess-bg/50 border border-chess-secondary/20"
                      data-testid={`friend-row-${f.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar url={f.avatarUrl} name={f.username} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{f.username}</span>
                            {(f.membershipTier === 'premium' || f.membershipTier === 'platinum') && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-400">Rating: {f.rating}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => removeFriend.mutate(f.id)}
                        disabled={removeFriend.isPending}
                        data-testid={`button-remove-friend-${f.id}`}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests */}
          <TabsContent value="requests" className="mt-4 space-y-4">
            <Card className="bg-chess-secondary/20 border-chess-secondary/30">
              <CardHeader>
                <CardTitle className="text-chess-secondary">Incoming Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {requestsQuery.isLoading ? (
                  [...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                ) : incoming.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">No incoming requests</p>
                ) : (
                  incoming.map(r => (
                    <div
                      key={r.friendshipId}
                      className="flex items-center justify-between p-3 rounded-lg bg-chess-bg/50 border border-chess-secondary/20"
                      data-testid={`incoming-row-${r.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar url={r.avatarUrl} name={r.username} />
                        <div>
                          <span className="font-medium text-white">{r.username}</span>
                          <p className="text-sm text-gray-400">Rating: {r.rating}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => acceptRequest.mutate(r.friendshipId)}
                          disabled={acceptRequest.isPending}
                          data-testid={`button-accept-${r.id}`}
                        >
                          <UserCheck className="w-4 h-4 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => removeRequest.mutate(r.friendshipId)}
                          disabled={removeRequest.isPending}
                          data-testid={`button-decline-${r.id}`}
                        >
                          <UserX className="w-4 h-4 mr-1" /> Decline
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-chess-secondary/20 border-chess-secondary/30">
              <CardHeader>
                <CardTitle className="text-chess-secondary">Sent Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {outgoing.length === 0 ? (
                  <p className="text-center text-gray-400 py-4">No pending sent requests</p>
                ) : (
                  outgoing.map(r => (
                    <div
                      key={r.friendshipId}
                      className="flex items-center justify-between p-3 rounded-lg bg-chess-bg/50 border border-chess-secondary/20"
                      data-testid={`outgoing-row-${r.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar url={r.avatarUrl} name={r.username} />
                        <div>
                          <span className="font-medium text-white">{r.username}</span>
                          <p className="text-sm text-gray-400">Rating: {r.rating}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-300 hover:text-white"
                        onClick={() => removeRequest.mutate(r.friendshipId)}
                        disabled={removeRequest.isPending}
                        data-testid={`button-cancel-${r.id}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Find people */}
          <TabsContent value="find" className="mt-4">
            <Card className="bg-chess-secondary/20 border-chess-secondary/30">
              <CardHeader>
                <CardTitle className="text-chess-secondary">Find Players</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by username (min 2 characters)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-chess-bg/50 border-chess-secondary/30 text-white"
                    data-testid="input-search-users"
                  />
                </div>

                <div className="space-y-2">
                  {debouncedSearch.length < 2 ? (
                    <p className="text-center text-gray-400 py-4">Type at least 2 characters to search</p>
                  ) : searchQuery.isLoading ? (
                    [...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                  ) : (searchQuery.data?.users ?? []).length === 0 ? (
                    <p className="text-center text-gray-400 py-4">No players found</p>
                  ) : (
                    (searchQuery.data?.users ?? []).map(u => {
                      const isFriend = friendIds.has(u.id);
                      const isOutgoing = outgoingIds.has(u.id);
                      const isIncoming = incomingIds.has(u.id);
                      return (
                        <div
                          key={u.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-chess-bg/50 border border-chess-secondary/20"
                          data-testid={`search-row-${u.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar url={u.avatarUrl} name={u.username} />
                            <div>
                              <span className="font-medium text-white">{u.username}</span>
                              <p className="text-sm text-gray-400">Rating: {u.rating}</p>
                            </div>
                          </div>
                          {isFriend ? (
                            <Badge className="bg-green-600">Friend</Badge>
                          ) : isOutgoing ? (
                            <Badge variant="secondary">Request Sent</Badge>
                          ) : isIncoming ? (
                            <Badge className="bg-blue-600">Wants to be friends</Badge>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-chess-primary hover:bg-chess-primary/80"
                              onClick={() => sendRequest.mutate(u.id)}
                              disabled={sendRequest.isPending}
                              data-testid={`button-add-${u.id}`}
                            >
                              <UserPlus className="w-4 h-4 mr-1" /> Add
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
