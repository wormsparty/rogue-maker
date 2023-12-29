import { Grid, State } from './types';
import { colors, obstacles, walkable, textRegexp } from './consts';
import font from '../assets/Inconsolata.ttf';

let grid: Grid = {} as Grid;
let state: State = {
	itemIndex: 0,
	mode: 'play',
	layer: 'map',
	question: '',
	answer: '',
	answered: undefined,
	currentX: 0,
	currentY: 0,
};

const switchToMode = (newMode: 'play' | 'text' | 'item') => {
  state.mode = newMode;
  draw(`Mode: ${state.mode}`);
}

const draw = (singleMessage?: string) => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.font = '32px Inconsolata';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const scaleX = window.innerWidth / 1024;
  const scaleY = window.innerHeight / 768;
  
  const scale = Math.min(scaleX, scaleY);

  const marginLeft = (window.innerWidth - 1024 * scale) / 2;
  const marginTop = (window.innerHeight - 768 * scale) / 2;

  const ajustementLeft = window.innerWidth - 1024 * scale - marginLeft * 2;
  const ajustementTop = window.innerHeight - 768 * scale - marginTop * 2;

  ctx.fillStyle = '#050505';
  
  if (marginLeft > 0) {
    ctx.fillRect(0, 0, marginLeft, window.innerHeight);
    ctx.fillRect(window.innerWidth - marginLeft - ajustementLeft, 0, marginLeft, window.innerHeight);
  }

  if (marginTop > 0) {
    ctx.fillRect(0, 0, window.innerWidth, marginTop);
    ctx.fillRect(0, window.innerHeight - marginTop - ajustementTop, window.innerWidth, marginTop);
  }

  ctx.translate(marginLeft, marginTop);
  ctx.scale(scale, scale);

  let posx = 0;
  let posy = 16;

  for (let j = 0; j < grid.height; j++) {
    let line = grid.map[j];
    let text = line[0];

    for (let i = 1; i < grid.width; i++) {
      const chr = line[i];

      if (chr == text[0]) {
        text += chr;
      } else {
        let color = grid.palette.get(text[0]);

	if (!color) {
	  color = grid.palette.get('t') ?? 0;
	}

        ctx.fillStyle = colors[color];
        ctx.fillText(text, posx, posy);
        posx += text.length * 16;

	text = chr;
      }
    }

    if (text.length > 0) {
      let color = grid.palette.get(text[0]);

      if (!color) {
        color = grid.palette.get('t') ?? 0;
      }

      ctx.fillStyle = colors[color];
      ctx.fillText(text, posx, posy);
    }

    posy += 32;
    posx = 0;
  }
 
  if (state.mode !== 'play') {
    ctx.fillStyle = colors[0];
    ctx.fillRect(state.currentX * 16, state.currentY * 32, 16, 32);
  
    if (state.mode === 'item') {
      ctx.fillStyle = colors[8];
      ctx.fillText(obstacles[state.itemIndex], state.currentX * 16, state.currentY * 32 + 16);
    }
  } else {
    ctx.fillStyle = '#000000';
    ctx.fillRect(state.currentX * 16, state.currentY * 32, 16, 32);
    
    ctx.fillStyle = colors[2];
    ctx.fillText('@', state.currentX * 16, state.currentY * 32 + 16);
  }

  ctx.fillStyle = colors[0];
  
  if (singleMessage !== undefined) {
    ctx.fillText(singleMessage, 16, 48);	
  } else if (state.question) {
    ctx.fillText(state.question + state.answer, 16, 48);
  } 
}

document.addEventListener("DOMContentLoaded", () => {
	var consoleFont = new FontFace('Inconsolata', `url(${font})`);

	consoleFont.load().then(async (font) => {
		(<any>document).fonts.add(font);
		grid = await (<any>window).api.load('default.json');

		if (grid === null) {
			grid = newMap('default.json');
		}

		state.currentX = grid.startX;
		state.currentY = grid.startY;

		draw();
	});
});

window.addEventListener("resize", () => {
	draw();
});

const move = (diffX: number, diffY: number): void => {
	if (state.mode !== 'play') {
		state.currentX += diffX;
		state.currentY += diffY;
		return;
	}

	let x = state.currentX + diffX;
	let y = state.currentY + diffY;

	if (x < 0) {
		x = 0;
	}

	if (x > grid.width - 1) {
		x = grid.width - 1;
	}

	if (y < 0) {
		y = 0;
	}

	if (y > grid.height - 1) {
		y = grid.height - 1;
	}

	let symbol = grid.map[y][x];

	if (walkable.indexOf(symbol) > -1) {
		state.currentX = x;
		state.currentY = y;
    		return;
	}

	if (state.currentY !== y) {
		symbol = grid.map[y][state.currentX];

		if (walkable.indexOf(symbol) > -1) {
			state.currentY = y;
			return;
		} else {
        		if (state.currentX !== x) {
          			symbol = grid.map[state.currentY][x];
			}

			if (walkable.indexOf(symbol) > -1) {
				state.currentX = x;
				return;
			}
		}
	} else {
      		symbol = grid.map[state.currentY][x];

		if (walkable.indexOf(symbol) > -1) {
			state.currentX = x;
			return;
		}
	}
}

const moveLeft = () => {
	if (state.currentX === 0) {
		goTo(0);
	} else {
		move(-1, 0);
		draw();
	}
};

const moveRight = () => {
	if (state.currentX === grid.width - 1) {
		goTo(3);
	} else {
		move(1, 0);
		draw();
	}
};

const moveDown = () => {
	if (state.currentY === grid.height - 1) {
		goTo(2);
	} else {
		move(0, 1);
		draw();
	}
};

const moveUp = () => {
	if (state.currentY === 0) {
		goTo(1);
	} else {
		move(0, -1);
		draw();
	}
}

const moveUpLeft = () => {
	if (state.currentY === 0) {
		goTo(1);
	} else if (state.currentX === 0) {
		goTo(0);
	} else {
		move(-1, -1);
		draw();
	}
};

const moveUpRight = () => {
	if (state.currentY === 0) {
		goTo(1);
	} else if (state.currentX === grid.width - 1) {
		goTo(3);
	} else {
		move(1, -1);
		draw();
	}
};

const moveDownLeft = () => {
	if (state.currentY === grid.height - 1) {
		goTo(2);
	} else if (state.currentX === 0) {
		goTo(0);
	} else {
		move(-1, 1);
		draw();
	}
};

const moveDownRight = () => {
	if (state.currentY === grid.height - 1) {
		goTo(2);
	} else if (state.currentX === grid.width - 1) {
		goTo(3);
	} else {
		move(1, 1);
		draw();
	}
};

const newMap = (name: string) => {
	const mapData: Grid = {
		name: name,
		width: 64, 
		height: 24,
		startX: 32,
		startY: 12,
		map: [],
		neighbors: [null, null, null, null],
		palette: new Map<string, number>(),
	}

	for (let i = 0; i < mapData.height; i++) {
		mapData.map[i] = '.'.repeat(mapData.width);
	}
	
	console.log('Map ' + name + ' created');
	return mapData;
}

const goTo = async (index: number) => {
	let newGrid;
	const map = grid.neighbors[index];

	if (map !== null) {
		const lastX = state.currentX;
		const lastY = state.currentY;

		grid = await (<any>window).api.load(map);
		
		if (index === 0) {
			state.currentX = grid.width - 1;
			state.currentY = lastY;
		} else if (index === 1) {
			state.currentX = lastX;
			state.currentY = grid.height - 1;
		} else if (index === 2) {
			state.currentX = lastX;
			state.currentY = 0; 
		} else {
			state.currentX = 0;
			state.currentY = lastY;
		}

		draw();
		return;
	}
	
	if (state.mode === 'play') {
		draw();
		return;
	}

	// TODO: Ask for new / link to existing / delete
	state.question = 'Enter new map name (or esc): ';
	state.answer = '';
	state.answered = async (answer: string) => {
		const newMapName = `${answer}.json`;
		const fileExists = await (<any>window).api.fileExists(newMapName);

		if (fileExists) {
			state.question = '';
			draw('File already exists.');
			return;
		}

		grid.neighbors[index] = newMapName;
		await (<any>window).api.save(grid);

		newGrid = newMap(newMapName);

		if (index === 0) {
			newGrid.neighbors[3] = grid.name;
		} else if (index === 1) {
			newGrid.neighbors[2] = grid.name;
		} else if (index === 2) {
			newGrid.neighbors[1] = grid.name;
		} else {
			newGrid.neighbors[0] = grid.name;
		}

		await (<any>window).api.save(newGrid);

		state.question = '';
		grid = newGrid;
		draw(`Map ${newMapName} created`);
	}

	draw();
};

const write = (chr: string) => {
	const line = grid.map[state.currentY];
	grid.map[state.currentY] = line.substring(0, state.currentX) + chr + line.substring(state.currentX + 1);
};

window.addEventListener("keydown", async (event: any) => {
	if (event.ctrlKey && event.key === 's') {
		await (<any>window).api.save(grid);
		draw(`Saved successfully.`);
		return;
	}
	
	if (state.question) {
		if (event.key.length === 1) {
			state.answer += event.key;
		} else if (event.key === 'Backspace') {
			state.answer = state.answer.slice(0, -1);
		} else if (event.key === 'Enter') {
			state.answered(state.answer);
		} else if (event.key === 'Escape') {
			state.question = '';
		}

		draw();
		return;
	}
	
	if (event.key === 'F1') {
		switchToMode('item');
		return;
	} else if (event.key === 'F2') { 
		switchToMode('text');
		return;
	} else if (event.key === 'ArrowUp') {
		if (event.shiftKey) {
			moveUpRight();
		} else {
			moveUp();
		}
		return;
	} else if (event.key === 'ArrowDown') {
		if (event.shiftKey) {
			moveDownLeft();
		} else {
			moveDown();
		}
		return;
	} else if (event.key === 'ArrowLeft') {
		if (event.shiftKey) {
			moveUpLeft();
		} else {
			moveLeft();
		}
		return;
	} else if (event.key === 'ArrowRight') {
		if (event.shiftKey) {
			moveDownRight();		
		} else {
			moveRight();
		}
		return;
	} else if (event.code === 'Numpad1') {
		moveDownLeft();
		return;
	} else if (event.code === 'Numpad2') {
		moveDown();
		return;
	} else if (event.code === 'Numpad3') {
		moveDownRight();
		return;
	} else if (event.code === 'Numpad4') {
		moveLeft();
		return;
	} else if (event.code === 'Numpad5') {
		draw();
		return;
	} else if (event.code === 'Numpad6') {
		moveRight();
		return;
	} else if (event.code === 'Numpad7') {
		moveUpLeft();
		return;
	} else if (event.code === 'Numpad8') {
		moveUp();
		return;
	} else if(event.code === 'Numpad9') {
		moveUpRight();
		return;
	}

	if (state.mode !== 'play') {
		if (event.key === 'Escape') {
			switchToMode('play');
			return;
		} else if (event.key === 'Backspace') {	
			moveLeft();
			write(' ');
			return;
		} else if (event.key === 'Delete') {	
			write(' ');
			moveRight();	
			return;
		} else if (event.key === 'Enter') {
			moveDown();
			return;
		} else if (event.key === ' ') {
			if (state.mode == 'item') {
				write(obstacles[state.itemIndex]);
				moveRight();
				return;
			}
		}

		if (state.mode === 'text') {
			// Remove accents in regexp test.
			const norm = event.key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

			if (textRegexp.test(norm)) {
				write(event.key);
				moveRight();
			}
		} else {
			if (event.key === 'a') {
				if (state.itemIndex > 0) {
					state.itemIndex--;
				} else {
					state.itemIndex = obstacles.length - 1;
				}
			} else if (event.key === 's') {
				if (state.itemIndex < obstacles.length - 1) {
					state.itemIndex++;
				} else {
					state.itemIndex = 0;
				}
			} else {
				const number = Number(event.key);
		
				if (!Number.isNaN(number)) {
					const chr = grid.map[state.currentY][state.currentX];

					// We use one single palette value 't' for all text.
					if (textRegexp.test(chr) && chr !== '.') {
						grid.palette.set('t', number);
					} else {
						grid.palette.set(chr, number);
					}
				}
			}
		}

		draw();
		return;
	}

	if (state.mode === 'play') {
		draw();
		return;
	}

	console.log(`Unknown mode: ${state.mode}`);
});
