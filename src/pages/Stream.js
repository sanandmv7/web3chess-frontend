import React, {
  useRef,
  Suspense,
  useState,
  useEffect,
  useContext,
} from "react";
import { useParams } from "react-router-dom";
import Store from "../utils/Store";
import { observer } from "mobx-react-lite";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Board from "../game/scene/board"; // Assumed to handle placing the board itself
import Setup from "../game/scene/setup"; // Assumed to handle placing pieces based on positions
import { webSocketURL } from "../utils/const";
import { Models } from "../game/scene/piece";
import { Colors } from "../game/scene/utils";
import { getCoordsFromNotation } from "../game/scene/coordutils";

import {
  getRandomChessImagePath,
  MSG_DELIM,
  splitMessage,
} from "../utils/utils";

// Import UI components if they're used
import TopNav from "../components/TopNav";
import PlayerLeft from "../components/PlayerLeft";
import PlayerRight from "../components/PlayerRight";
import Chat from "../components/Chat";
import ModalSuperChat from "../components/ModalSuperChat";

const CameraControls = () => {
  const {
    camera,
    gl: { domElement },
  } = useThree();
  const controls = useRef();
  useFrame(() => controls.current?.update());
  return (
    <OrbitControls
      ref={controls}
      args={[camera, domElement]}
      enableDamping={true}
      enablePan={false}
    />
  );
};

const Stream = observer(() => {
  const [positions, setPositions] = useState([]);
  const params = useParams();
  const [streamWhitePubkey, setStreamWhitePubkey] = useState(null);
const [streamBlackPubkey, setStreamBlackPubkey] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(webSocketURL);

    ws.onopen = () => {
      ws.send(`get_game::${params.gameCode}`);
    };

    ws.onmessage = (event) => {
      console.log("meet-log:", event);
      let msg = event.data;
      let [cmd, arg] = splitMessage(msg);
      switch (cmd) {
        case "stream":
          console.log("stream");
          let [gameCode, fen1] = splitMessage(arg);
          console.log(gameCode + ":" + fen1);

          if (params.gameCode === gameCode) {
            // Ensure we're handling the correct game
            // let [from, to] = splitMessage(move);
            // console.log(
            //   "gamecode = " + gameCode + " from = " + from + " to = " + to
            // );
            // performMove(from, to);
            updateBoard(fen1);
          }
          break;
        case "init_game":
          let [gg, extra] = splitMessage(arg);
          let [fen, extra2] = splitMessage(extra);
          let [whitePubkey, blackPubkey] = splitMessage(extra2);
          // const [gameCode, fen, whitePubkey, blackPubkey] = arg.split("::");
          console.log(`fen: ${fen}`);
          if (gg === params.gameCode) {
            updateBoard(fen);
            setStreamWhitePubkey(whitePubkey);
            setStreamBlackPubkey(blackPubkey);
          }
          break;
        default:
          console.log("Received unknown command:", cmd);
      }
    };

    return () => {
      ws.close();
      console.log("WebSocket connection closed.");
    };
  }, [params.gameCode, setStreamWhitePubkey, setStreamBlackPubkey]);

  // function getCoordsFromNotation(notation) {
  //   // Convert the file (letter) to a column index. 'a' becomes 0, 'b' becomes 1, etc.
  //   const fileToColumn = {
  //     a: 0,
  //     b: 1,
  //     c: 2,
  //     d: 3,
  //     e: 4,
  //     f: 5,
  //     g: 6,
  //     h: 7,
  //   };

  //   // Extract the file (column letter) and rank (row number) from the notation
  //   const file = notation.charAt(0);
  //   const rank = notation.charAt(1);

  //   // Convert the file to a column index
  //   const j = fileToColumn[file.toLowerCase()];

  //   // Convert the rank to a row index. Chess ranks start at 1 from the bottom (from White's perspective),
  //   // so we subtract 1 to make it zero-indexed. We also subtract from 7 to invert the rank order
  //   // because array rows are typically rendered top-to-bottom, but ranks increase bottom-to-top.
  //   const i = 7 - (rank - 1);

  //   return { i, j };
  // }

  

  const performMove = (fromNotation, toNotation) => {
    const fromCoords = getCoordsFromNotation(fromNotation);
    const toCoords = getCoordsFromNotation(toNotation);
  
    setPositions((currentPositions) => {
      const newPositions = currentPositions.map((piece) => {
        if (piece.i === fromCoords.i && piece.j === fromCoords.j) {
          // Move piece to the 'to' position
          return { ...piece, i: toCoords.i, j: toCoords.j };
        } else if (piece.i === toCoords.i && piece.j === toCoords.j) {
          // Handle capture (if any) - Example: simply remove the piece for now
          return null; // This piece is captured, remove it
        }
        return piece; // No change for this piece
      }).filter(piece => piece !== null); // Remove nulls (captured pieces)
  
      return newPositions;
    });
  };
  

  const updateBoard = (fen) => {
    const newPositions = parseFenToPositions(fen);
    setPositions(newPositions);
  };

  const parseFenToPositions = (fen) => {
    const parts = fen.split(" ");
    const rows = parts[0].split("/");
    const newPositions = [];

    rows.forEach((row, rowIndex) => {
      let colIndex = 0;
      for (const char of row) {
        if (isNaN(char)) {
          newPositions.push({
            model: getModelFromFenChar(char),
            side: isUpperCase(char) ? Colors.WHITE : Colors.BLACK,
            i: 7 - rowIndex,
            j: colIndex,
          });
          colIndex += 1;
        } else {
          colIndex += parseInt(char, 10);
        }
      }
    });

    return newPositions;
  };

  const getModelFromFenChar = (char) => {
    switch (char.toLowerCase()) {
      case "p":
        return Models.PAWN;
      case "n":
        return Models.KNIGHT;
      case "b":
        return Models.BISHOP;
      case "r":
        return Models.ROOK;
      case "q":
        return Models.QUEEN;
      case "k":
        return Models.KING;
      default:
        return null;
    }
  };

  const isUpperCase = (char) => char === char.toUpperCase();

  return (
    <>
      <div className="bg-dark h-screen overflow-auto">
        <TopNav />
        <PlayerLeft pubKey={streamWhitePubkey} />
        <PlayerRight pubKey={streamBlackPubkey} />
        <Suspense fallback={<div>Loading...</div>}>
          <Canvas
            gl={{ antialias: true }}
            dpr={Math.max(window.devicePixelRatio, 2)}
          >
            <CameraControls />
            <group rotation={[0, 0, 0]}>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 15, 10]} angle={0.3} />
              <Board active={[]} handleBlockClick={() => {}} playerColor={0} />
              <Setup positions={positions} />
            </group>
          </Canvas>
        </Suspense>
        {/* <Suspense fallback={<></>}>
            <Canvas
              gl={{ antialias: true }}
              dpr={Math.max(window.devicePixelRatio, 2)}
            >
              <CameraControls />
              <group rotation={[0, 0, 0]}>
                <ambientLight />
                <pointLight position={[4.5, 4.5, 20]} />
                <pointLight position={[-4.5, -4.5, 20]} />
                <pointLight position={[4.5, -4.5, 20]} />
                <pointLight position={[-4.5, 4.5, 20]} />
                <Board
                  active={[]}
                  handleBlockClick={() => {}}
                  playerColor={0}
                />
                <Setup
                  positions={positions}
                  handlePieceClick={() => {}}
                  playerColor={0}
                />
              </group>
            </Canvas>
          </Suspense> */}
      </div>
    </>
  );
});

export default Stream;
