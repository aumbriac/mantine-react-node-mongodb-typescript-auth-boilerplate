import React, { FormEvent, useState } from "react";
import { Box, TextInput, Group, Button, PasswordInput, Text, Modal } from "@mantine/core"
import { useForm } from '@mantine/form';
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { showNotification } from '@mantine/notifications'
import { IconAlertCircle } from "@tabler/icons";
import { setUser } from "../context/AppReducer";

export default function LoginForm(){
  const { dispatch } = useAppContext() 
  const navigate = useNavigate()
  const [opened, setOpened] = useState(false);

  const loginForm = useForm({
    initialValues: {
      email: '',
      password: ''
    },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value: string) => value !== "" ? null : 'Please enter a password'
    },
  });

  const forgotPasswordForm = useForm({
    initialValues: {
      email: ''
    },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email')
    },
  })

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    if (loginForm.validate().hasErrors){
      return
    }
    const { data } = await axios.post('http://localhost:3001/login', loginForm.values)
    if (data.accessToken && data.refreshToken){
        localStorage.setItem('boilerplate', JSON.stringify({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken
        }))
        dispatch(setUser(loginForm.values.email))
        navigate('/members')
    } else {
      showNotification({
        title: 'Error',
        color: 'red',
        icon: <IconAlertCircle />,
        message: data.msg,
      })    
    }
  }

  const handleForgotPassword = async () => {
    if (forgotPasswordForm.validate().hasErrors){
      return
    }
    const { data } = await axios.post('http://localhost:3001/forgotPassword', { email: forgotPasswordForm.values.email })
    console.log(data)
    showNotification({
      title: "Request processed",
      message: "Please check your email"
    })
    forgotPasswordForm.reset()
    setOpened(false)
  }

  return (
    <Box sx={{ maxWidth: 300 }} mx="auto">
      <form onSubmit={e => handleLogin(e)}>
        <TextInput
          withAsterisk
          autoComplete="email"
          label="Email"
          placeholder="your@email.com"
          {...loginForm.getInputProps('email')}
        />
        <PasswordInput
          autoComplete="password"
          withAsterisk
          label="Password"
          {...loginForm.getInputProps('password')}
        />
        <Text variant="link" onClick={() => setOpened((o) => !o)} size="sm">Forgot Password?</Text>
        <Modal
          opened={opened}
          centered
          withCloseButton
          title={'Enter your email to obtain a reset password link'}
          onClose={() => setOpened(false)}
          size="lg"
          radius="md"
        >
          <Group align="flex-end">
            <TextInput placeholder="youremail@gmail.com" style={{ flex: 1 }} {...forgotPasswordForm.getInputProps('email')} />
            <Button onClick={handleForgotPassword}>Submit</Button>
          </Group>
        </Modal>
        <Group position="right" mt="md">
          <Button type="submit">Login</Button>
        </Group>
      </form>
    </Box>
  )
}