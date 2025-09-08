import { Link, Outlet, useLocation } from 'react-router-dom'
import { AppBar, Box, Container, Toolbar, Typography, Button } from '@mui/material'

export default function App() {
  const loc = useLocation()
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>URL Shortener</Typography>
          <Button color="inherit" component={Link} to="/" disabled={loc.pathname === '/'}>Shorten</Button>
          <Button color="inherit" component={Link} to="/stats" disabled={loc.pathname === '/stats'}>Stats</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4, mb: 4 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
