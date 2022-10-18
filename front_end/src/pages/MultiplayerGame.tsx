import { Switch } from '@mui/material';
import React, { useContext } from 'react'
import { Navigate, useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';

const OPPONENT = 0;
const PLAYER = 1;
const BALL = 2;

let defaultColor = 'grey'

class MultiPong extends React.Component <any, any>{
	constructor(props: any){
		super(props);
		this.state = this.InitState();
	}
	
	socket: any = null

	canv = {
		position: 'relative',
		height: 700,
		width: 1400,
		backgroundColor: defaultColor,
		margin: 'auto',
		marginTop: 50,
		border: '1px solid white'
	} as const;
	
	opponentStyle = {
		position: 'absolute',
		left: this.canv.width - 40,
		top: this.canv.height/4,
		height: 100,
		width: 20,
		backgroundColor : "black",
	} as const;
	
	playerStyle = {
		position: 'absolute',
		top: this.canv.height/4,
		left: 20,
		height: 100,
		width: 20,
		backgroundColor : "black",
	} as const;
	
	ballStyle = {
		position: 'absolute',
		left: this.canv.width/2,
		top: this.canv.height/4,
		marginTop: 200,
		height: 20,
		width: 20,
		display: "block",
		backgroundColor: "yellow",
		borderRadius: "100%",
		
	} as const;

	moveEvent = (event: any) => {
		let mousey = event.clientY;
		if (mousey <= 175) {
			mousey = 175
		}
		else if (mousey >= 775) {
			mousey = 775
		}
		this.socket?.emit('position', {pos: mousey, room: this.state.room})
		// const movedPlayer = this.moveBoard(mousey);
		// this.setState({player: movedPlayer, pause: false})
		// this.setState({})
	}
	
	getStyle = (val: number) => {
		if(val === OPPONENT)
			return this.opponentStyle;
		else if (val === PLAYER)
			return this.playerStyle;
		return this.ballStyle;
	}
	
	InitState = () =>{
		return {
			player: 0, 
			opponent: 0,
			
			ball: this.canv.width/2 + this.canv.height/4,
			ballSpeed: 2,
			deltaY: -1,
			deltaX: -1,
			
			pause: true,
			
			opponentSpeed: 5,
			opponentStep: 2,
			opponentDir: false,
			
			playerScore: 0,
			opponentScore: 0,

			p1name: "",
			p2name: "",
			room: "",
			finished: false
		}
	}
	
	resetGame = () => {
		this.ballStyle = {...this.ballStyle, top: this.canv.height/4}
		this.ballStyle = {...this.ballStyle, left: this.canv.width/2}
		this.setState({ball: this.ballStyle})
	}
	
	touchingEdge = (pos: number) => {
		if(pos <= 200 || pos >= this.canv.height + 100)
			return true
		return false
	}
	
	ballTouchingHorEdge = (pos: number) => {
		const nextPosY = this.ballStyle.top + pos;
		
		if((nextPosY <= -200) || (nextPosY >= this.canv.height - 220))
			return true
		return false
	}
	
	ballTouchPaddle = () => {
		const nextPosX = this.ballStyle.left + this.state.deltaX;
		const nextPosY = this.ballStyle.top + this.state.deltaY;
		
		if((nextPosX === this.playerStyle.left + 20) && (nextPosY >= this.playerStyle.top -225 && nextPosY <= this.playerStyle.top - 115))
			return true
		if((nextPosX === this.opponentStyle.left - 20) && (nextPosY >= this.opponentStyle.top - 225 && nextPosY <= this.opponentStyle.top -115))
			return true
		return false
	}
	
	moveBoard = (pos: number) => {
		
		if(!this.touchingEdge(pos))
			this.playerStyle = {...this.playerStyle, top: pos - 200}
		return this.playerStyle.top
	}
		
	isScore = () => {
		if(this.ballStyle.left <= 10 || this.ballStyle.left >= this.canv.width - 20)
			return true
		return false
	}
	
	bounceBall = () => {
		if(this.ballTouchPaddle())
		{
			this.setState({deltaX: -this.state.deltaX});
			this.ballStyle = {...this.ballStyle, left: this.ballStyle.left - this.state.deltaX}
		}
		if(this.ballTouchingHorEdge(this.state.deltaY))
		{
			this.setState({deltaY: -this.state.deltaY});
			this.ballStyle = {...this.ballStyle, top: this.ballStyle.top - this.state.deltaY}
		}
		if (!(this.ballTouchPaddle()) && !(this.ballTouchingHorEdge(this.state.deltaY)))
		{
			this.ballStyle = {...this.ballStyle, top: this.ballStyle.top + this.state.deltaY}
			this.ballStyle = {...this.ballStyle, left: this.ballStyle.left + this.state.deltaX}
		}
		
		this.setState({ball: this.ballStyle})
		
		if(this.isScore()){
			if(this.state.deltaX === -1)
			this.setState({opponentScore: this.state.opponentScore+1})
			else
			this.setState({playerScore: this.state.playerScore+1})
			this.resetGame();
		}
	}
	
	moveElements = (data: any) => {
		
		this.playerStyle = {...this.playerStyle, top: data.player1Pos - 175}
		this.opponentStyle = {...this.opponentStyle, top: data.player2Pos - 175}
		this.ballStyle = {...this.ballStyle, top: data.ballPos.top, left: data.ballPos.left}
		this.setState({player: this.playerStyle, opponent: this.opponentStyle})
	}
	
	componentDidMount() {
		console.log(window.innerWidth, window.outerWidth)
		
		this.socket = this.context
		
		this.socket?.on('data', ({data}: any) => {
			this.moveElements(data)
			this.setState({p1name: data.player1, p2name: data.player2, playerScore: data.p1Score, opponentScore: data.p2Score, room: data.room})
		})

		this.socket?.on('end', () => {
			this.setState({finished: true})
			window.removeEventListener("mousemove", this.moveEvent)
		})

		this.socket?.on('exception', (data: any) => {
			console.log('frog')
			if (data?.message === "???? this room does not exist") {
				this.setState({finished: true})
				window.removeEventListener("mousemove", this.moveEvent)
			}
		})	
		setTimeout(() => {window.addEventListener("mousemove", this.moveEvent)}, 500)
	}
		
	changeColor = (color: string) => () => {
		switch (color){
			case "red": {
				if(this.canv.backgroundColor === 'red')
				this.canv = {...this.canv, backgroundColor: defaultColor}
				else
				this.canv = {...this.canv, backgroundColor: 'red'}
				break;
			}
			case 'green': {
				if(this.canv.backgroundColor === 'green')
				this.canv = {...this.canv, backgroundColor: defaultColor}
				else
				this.canv = {...this.canv, backgroundColor: 'green'}
				break;
			}
			case 'blue': {
				if(this.canv.backgroundColor === 'blue')
				this.canv = {...this.canv, backgroundColor: defaultColor}
				else
				this.canv = {...this.canv, backgroundColor: 'blue'}
			}
		}
	}
			
	render() {
		return (
			<div style={ this.canv }>
				{this.state.finished && <Navigate to="/selectgamemode" replace={true} />}
				<div style={{position:'absolute'}}>{`${this.state.p1name} Score: ${this.state.playerScore}`}</div>
				<div style={{position:'absolute', marginTop: 20}}>{`${this.state.p2name} Score: ${this.state.opponentScore}`}</div>
				<div style={this.getStyle(OPPONENT)}></div>
				<div style={this.getStyle(PLAYER)}></div>
				<div style={this.getStyle(BALL)}></div>
				<button style={{position:'absolute', backgroundColor:'red', marginTop:this.canv.height + 10, marginLeft:'45%'}} onClick={this.changeColor("red")}>R</button>
				<button style={{position:'absolute', backgroundColor:'green', marginTop:this.canv.height + 10, marginLeft:'50%'}} onClick={this.changeColor('green')}>G</button>
				<button style={{position:'absolute', backgroundColor:'blue', marginTop:this.canv.height + 10, marginLeft:'55%'}} onClick={this.changeColor('blue')}>B</button>
			</div>
		)
	}
}

	MultiPong.contextType = GameContext
	
	export default MultiPong