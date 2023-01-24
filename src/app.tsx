import * as React from "react";
import { useQuery } from "react-query";
import styled from "styled-components";

const Container = styled.div`
  height: 100%;
  width: 100%;
  padding: 10px 6px;

  overflow: hidden auto;

  font-size: 16px;

  @media (min-width: 460px) {
    font-size: 26px;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: ${12 / 26}em;

  * {
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const H1 = styled.div`
  font-size: ${32 / 26}em;
  font-weight: 700;

  margin-bottom: 8px;
`;

const Entry = styled.a`
  max-width: 100%;
  flex-grow: 0;
  display: flex;
  gap: 8px;
  align-items: center;
  /* height: 70px; */
  text-decoration: none;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
`;

const Left = styled.img`
  flex-shrink: 0;
  object-fit: contain;
  height: 50px;
  width: 50px;

  @media (min-width: 460px) {
    height: unset;
    width: unset;
  }
`;

const Middle = styled.div`
  flex-shrink: 1;
  min-width: 0;
`;

const Channel = styled.div`
  font-size: ${28 / 26}em;
  font-weight: 600px;
`;

const Category = styled.div`
  font-size: 1em;
  font-weight: 300;
`;

const Right = styled.div`
  margin-left: auto;
  flex-shrink: 0;
`;

const clientId = "l3pj0aepy2pt31r2xv2bfyp2lebryx";
const redirect_uri = "https://eljose47.github.io/twitch";
// const redirect_uri = "http://localhost:3000";

interface User {
  id: string;
  login: string;
  display_name: string;
  offline_image_url: string;
  profile_image_url: string;
}

const App: React.FunctionComponent<AppProps> = (props) => {
  const { access_token } = React.useMemo(() => {
    const hash = new URLSearchParams(document.location.hash.slice(1));
    const output: Record<string, any> = {};

    for (const [key, value] of hash.entries()) {
      output[key] = value;
    }

    return output;
  }, []);

  const headers = {
    Authorization: `Bearer ${access_token}`,
    "Client-Id": clientId,
  };

  const { data: user } = useQuery(
    "user",
    () =>
      fetch("https://api.twitch.tv/helix/users", {
        headers,
      }).then((e) => e.json().then((e) => e.data[0] as User)),
    {
      enabled: !!access_token,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const { data } = useQuery(
    "followed",
    async () => {
      const followedUrl = new URL(
        "https://api.twitch.tv/helix/streams/followed"
      );
      followedUrl.searchParams.append("user_id", user!.id);

      const folowedResponse = await fetch(followedUrl, {
        headers,
      });

      const followedJson = await folowedResponse.json();

      if (!folowedResponse.ok) {
        throw followedJson;
      }

      const usersUrl = new URL("https://api.twitch.tv/helix/users");
      for (const stream of followedJson.data) {
        usersUrl.searchParams.append("id", stream.user_id);
      }

      const usersResponse = await fetch(usersUrl, {
        headers,
      });

      const users = await usersResponse
        .json()
        .then((output: { data: User[] }) =>
          Object.fromEntries(output.data?.map((e) => [e.id, e]) ?? [])
        );

      return { followed: followedJson.data, users };
    },
    { enabled: !!user, refetchInterval: 1000 * 60 }
  );

  const twitchAuthUrl = new URL("https://id.twitch.tv/oauth2/authorize");
  twitchAuthUrl.searchParams.append("client_id", clientId);
  twitchAuthUrl.searchParams.append("redirect_uri", redirect_uri);
  twitchAuthUrl.searchParams.append("response_type", "token");
  twitchAuthUrl.searchParams.append("scope", "user:read:follows");

  return (
    <Container>
      <H1>Followed Channels</H1>
      {access_token ? (
        <>
          {data?.followed && (
            <List>
              {data.followed.map((stream: any) => {
                if (!data) {
                  return null;
                }
                const user = data.users[stream.user_id];
                let profilePic = user?.profile_image_url;
                profilePic = profilePic?.replace("300x300", "70x70");

                const millisceondsdSinceStreamStarted =
                  Date.now() - new Date(stream.started_at).valueOf();

                const date = new Date(
                  Date.now() - new Date(stream.started_at).valueOf()
                );

                const hours_minutes = date.toLocaleString(undefined, {
                  timeZone: "UTC",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <Entry
                    key={stream.user_id}
                    href={`https://twitch.tv/${stream.user_login}`}
                    target="_blank"
                  >
                    <Left
                      alt={`${stream.user_name} profile picture`}
                      src={profilePic}
                    />
                    <Middle>
                      <Channel>{stream.user_name}</Channel>
                      <Category>{stream.game_name}</Category>
                    </Middle>
                    <Right>Live for: {hours_minutes}</Right>
                  </Entry>
                );
              })}
            </List>
          )}
        </>
      ) : (
        <a href={twitchAuthUrl.toString()}>Connect with Twitch</a>
      )}
    </Container>
  );
};

App.displayName = "App";

export default App;

export interface AppProps {}
