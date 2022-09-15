import { Text, Navbar as MantineNavbar } from "@mantine/core";

export default function Navbar() {

    return (
        <MantineNavbar
            p="md"
            hiddenBreakpoint="sm"
            hidden={false}
            width={{ sm: 100, lg: 200 }}
        >
            <Text>Application navbar</Text>
        </MantineNavbar>
    );
}
