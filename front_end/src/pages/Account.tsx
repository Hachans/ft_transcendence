import React, { useContext } from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import { UrlContext } from '../context/UrlContext'
import { RerenderContext } from '../context/RerenderContext'
import MatchHistory from '../components/MatchHistory'

import './styles/AccountStyles.css'

const Account: React.FC = () => {
	const [user, setUser] = useState<any>(null)
	// eslint-disable-next-line
	const [avatar, setAvatar] = useState<any>(null)
	const {context, setContext} = useContext(UserContext)
	// eslint-disable-next-line
	const {rerender, setRerender} = useContext(RerenderContext)
	const baseUrl = useContext(UrlContext)

	const navigate = useNavigate()

	const getName = () => {
		let config = {
			withCredentials: true
		}

		axios.get(baseUrl + "users/me", config).then(response => {
			setUser(response.data)
		}).catch((error) => {
			if (error.response.status === 401) {
				setContext?.(false)
				navigate("/login")
			}
			else {
				console.log(error)
			}
		})
	}

	useEffect(getName, [baseUrl, navigate, setContext])

	useEffect(() => {
		setAvatar(<Avatar src={baseUrl + `users/me/profileImg?${Date.now()}`} />)
	}, [rerender, context, baseUrl])

	//src={baseUrl + "users/me/profileImg"}
	//navigate("/settings")

	return (
		<section className="profile">
			<Box className="header">
				<div className="details">
					<div className="btn btn-one" onClick={() => (navigate("/settings"))}>
						<span className="btn btn-one">ACCOUNT SETTINGS</span>
					</div>
					<div className='emptySpace'></div>
					<img src={baseUrl + `users/me/profileImg?${Date.now()}`} alt="" className="profile-pic"></img>
					<h1 className="heading">Username: {user?.name}</h1>
					{user?.intraName && <h1 className="sub">Intra Name: {user?.intraName ? user?.intraName : 'not used'}</h1>} 
					<div className="stats">
						<div className="col-4">
							<h4>Score</h4>
							<p>{user?.score}</p>
						</div>
						<div className="col-4">
							<h4>Rank</h4>
							<p>{user?.rank}</p>
						</div>
					</div>
				</div>
			</Box>
			<Box maxWidth={'90%'} paddingLeft='10vw' paddingBottom={'2vh'} fontWeight='bold' textAlign={'center'} fontSize='4vh'>
			Match History
					<MatchHistory />
			</Box>
		</section>
	)
}

export default Account