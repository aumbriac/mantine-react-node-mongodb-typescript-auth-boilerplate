import React from 'react';
import { Tabs } from '@mantine/core'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'

export default function Landing(){
    return <Tabs defaultValue="login">
        <Tabs.List>
            <Tabs.Tab value="login">Login</Tabs.Tab>
            <Tabs.Tab value="register">Register</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="login" pt="xs">
            <LoginForm />
        </Tabs.Panel>

        <Tabs.Panel value="register" pt="xs">
            <RegisterForm />
        </Tabs.Panel>
    </Tabs>
}