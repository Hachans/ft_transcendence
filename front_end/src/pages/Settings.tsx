import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Notification from '../components/Notification'
import { UrlContext } from '../context/UrlContext'
import { RerenderContext } from '../context/RerenderContext'
import { UserContext } from '../context/UserContext'
import './styles/SettingsStyles.css'
import FormLabel from '@mui/material/FormLabel'

const Settings: React.FC = () => {
	const [name, setName] = useState('')
	const [message, setMessage] = useState<string | null>(null)
	const [qrUrl, setQrUrl] = useState('')
	const [code, setCode] = useState('')
	const [twoAuthOn, setTwoAuthOn] = useState(false)
	const [qrDisplayed, setQrDisplayed] = useState(false)
	const [selectedFile, setSelectedFile] = useState<any>(null)
	const baseUrl = useContext(UrlContext)
	const {rerender, setRerender} = useContext(RerenderContext)
	// eslint-disable-next-line
	const {context, setContext} = useContext(UserContext)
	const navigate = useNavigate()

	const enterKeyCode = 13

	useEffect(() => {
		axios.get(baseUrl + "users/me", {withCredentials: true}).then((response) => {
			if (response.data.twoFactorAuth) {
				setTwoAuthOn(true)
			}
		})
	}, [baseUrl])

	const handleSubmit = (event: any) => {
		// event.preventDefault()
		const formData = new FormData()
		formData.append('file', selectedFile)

		if (selectedFile !== null) {
			axios.post(baseUrl + 'users/me/profileImg', formData, {withCredentials: true, headers: {
				'Content-Type': 'multipart/form-data'
			} }).catch((error) => {
				console.log(error)
				if (error.response.status === 401) {
					setContext?.(false)
					navigate("/login")
				}
			})
			setRerender?.(!Boolean(rerender))
			navigate("/account")
		}
		else {
			setMessage("No file uploaded, or file type is not supported. Supported file types: jpeg, jpg, png")
		}
	}

	const handleFileSelect = (event: any) => {
		if (event.target.files[0] === null || event.target.files[0] === undefined
			|| !(['image/jpeg', 'image/jpg', 'image/png'].includes(event.target.files[0].type))) {
				setSelectedFile(null);
			}
		else {
			setMessage("")
			setSelectedFile(event.target.files[0])
		}
	}

	const handleNameChange = () => {
		axios.post(baseUrl + "users/me/name", {name}, {withCredentials: true}).then(() => {
			navigate("/account")
		}).catch((error) => {
			if (error.response.status === 401) {
				setContext?.(false)
				navigate("/login")
			}
			setMessage(error.response.data.message)
			setTimeout(() => {
				setMessage(null)
			}, 5000)
		})
	}

	const handleNameEnterKey = (event: any) => {
		if (event.keyCode === enterKeyCode) {
			handleNameChange()
		}
	}

	const handle2fa = () => {
		axios.post(baseUrl + "auth/2fa/turn-on", {twoFactorAuthenticationCode: code}, {withCredentials: true}).then(() => {
			navigate("/account")
		})
	}

	const handle2faEnterKey = (event: any) => {
		if (event.keyCode === enterKeyCode) {
			handle2fa()
		}
	}

	// drag state
	const [dragActive, setDragActive] = useState(false);

	// handle drag events
	const handleDrag = function(e) {
		e.preventDefault();
		e.stopPropagation();
		if ( !(
			e.dataTransfer.types &&
			( e.dataTransfer.types.indexOf ? e.dataTransfer.types.indexOf( "Files" ) !== -1 : e.dataTransfer.types.contains( "Files" ) )
		) ) {
			setDragActive(false);
		}
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}

	// triggers when file is dropped
	const handleDrop = function(e) {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		if ((e.dataTransfer.files[0] === null || e.dataTransfer.files[0] === undefined
			|| !(['image/jpeg', 'image/jpg', 'image/png'].includes(e.dataTransfer.files[0].type)))) {
				setMessage("No file uploaded, or file type is not supported. Supported file types: jpeg, jpg, png")
				return
			}
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			setSelectedFile(e.dataTransfer.files[0])
			setMessage("")
		}
	}

	return (
		<div>
			<Notification message={message} />
			<Container maxWidth="sm">
				<Grid container
					spacing={2}
					direction="column"
					justifyContent="center"
					style={{minHeight: "80vh",
						// background: "linear-gradient(to right, #37292b, #064870"
					}}
				>
					<Paper elevation={2} sx={{padding: 5}}>
						<FormLabel>
							<Grid container direction="column" spacing={2}>
								<Grid item>
									<TextField fullWidth
										label="New username"
										placeholder="Username"
										variant="outlined"
										required
										onChange={(e) => {setName(e.target.value)}}
										onKeyDown={handleNameEnterKey}
									/>
								</Grid>
								<Grid item>
									<Button fullWidth variant="contained" onClick={handleNameChange}>
										Change username
									</Button>
								</Grid>
								<Grid item onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
								<Paper id='drop-container' className={dragActive ? "drag-active" : ""}>
									<FormLabel htmlFor="uploadBtn">
										<Box className="drop-title">Drop an image here</Box>
										<Box className="drop-title">or</Box>
										{selectedFile !== null ? <Box className="uploaded"> uploaded: {selectedFile.name} </Box>
										: <Box className="drop-title2">upload from device</Box> }
										<input type="file"  onChange={handleFileSelect} id='uploadBtn' ></input>
									</FormLabel>
								</Paper>
								{ dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div> }
								</Grid>
								<Grid item>
									<Button fullWidth variant="contained" onClick={handleSubmit} >
										Upload new profile picture
									</Button>
								</Grid>
								{(!qrDisplayed && !twoAuthOn) && <Grid item>
									<Button fullWidth onClick={() => {
										axios.get(baseUrl + "auth/2fa/generate", {withCredentials: true}).then((response) => {
											setQrUrl(response.data)
											setQrDisplayed(true)
										})
									}}>
										Enable Google authenticator
									</Button>
								</Grid>}
								{(qrDisplayed && !twoAuthOn) && <Grid item>
									<Box display="flex" justifyContent="center" alignItems="center" flex={1}>
										<img src={qrUrl} alt="QRCode" />
									</Box>
								</Grid>}
								{(qrDisplayed && !twoAuthOn) && <Grid item>
									<TextField fullWidth
										label="Google Authenticator code"
										placeholder="Code"
										variant="outlined"
										required
										onChange={(e) => {setCode(e.target.value)}}
										onKeyDown={handle2faEnterKey}
									/>
								</Grid>}
								{(qrDisplayed && !twoAuthOn) && <Grid item>
									<Button fullWidth variant="contained" onClick={() => {
										axios.post(baseUrl + "auth/2fa/turn-on", {twoFactorAuthenticationCode: code}, {withCredentials: true}).then(() => {
											navigate("/account")
										})
									}}>
										Submit
									</Button>
								</Grid>}
								{twoAuthOn && <Grid item>
									<Button fullWidth onClick={() => {
										axios.post(baseUrl + "auth/2fa/turn-off", {}, {withCredentials: true}).then(() => {
											navigate("/account")
										})
									}}>
										Disable Google authenticator
									</Button>
								</Grid>}
							</Grid>
						</FormLabel>
					</Paper>
				</Grid>
			</Container>
		</div>
	)
}

export default Settings