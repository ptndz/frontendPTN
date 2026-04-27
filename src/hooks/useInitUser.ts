import { useEffect } from "react";
import { User } from "../gql/graphql";
import { useStoreUser } from "../store/user";

export function useInitUser(userData: User | null | undefined) {
  const { setUser } = useStoreUser();
  useEffect(() => {
    if (userData) setUser(userData);
  }, [setUser, userData]);
}
