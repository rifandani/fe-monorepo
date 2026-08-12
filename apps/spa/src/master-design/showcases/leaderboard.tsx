import {
  Leaderboard,
  LeaderboardContent,
  LeaderboardEnd,
  LeaderboardHeader,
  LeaderboardItem,
  LeaderboardStart,
  LeaderboardTitle,
} from "@/core/components/ui/leaderboard";

import { Variant, VariantGrid } from "../variant";

export const LeaderboardShowcase = () => (
  <VariantGrid>
    <Variant className="w-72" label="sources">
      <Leaderboard className="w-72">
        <LeaderboardHeader>
          <LeaderboardTitle>Top sources</LeaderboardTitle>
        </LeaderboardHeader>
        <LeaderboardContent>
          <LeaderboardItem maxValue={100} value={82}>
            <LeaderboardStart>Direct</LeaderboardStart>
            <LeaderboardEnd>82</LeaderboardEnd>
          </LeaderboardItem>
          <LeaderboardItem maxValue={100} value={64}>
            <LeaderboardStart>Organic</LeaderboardStart>
            <LeaderboardEnd>64</LeaderboardEnd>
          </LeaderboardItem>
          <LeaderboardItem maxValue={100} value={41}>
            <LeaderboardStart>Referral</LeaderboardStart>
            <LeaderboardEnd>41</LeaderboardEnd>
          </LeaderboardItem>
        </LeaderboardContent>
      </Leaderboard>
    </Variant>
  </VariantGrid>
);
