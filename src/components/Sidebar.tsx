import { Aside, MediaQuery, Text } from "@mantine/core";

export default function Sidebar() {
  return (
    <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
      <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 100, lg: 200 }}>
        <Text>Application sidebar</Text>
      </Aside>
    </MediaQuery>
  );
}
