import type { Level } from './types'
import { row, col, perimeter as perimeterCells } from './helpers'

export const sampleLevels: Level[] = [
  {
    id: 'first-paint', title: 'Первая клетка',
    goal: 'Закрась клетку, на которой стоит Робот.',
    intro: 'Робот стоит на клетке. Команда «закрасить» красит клетку под ним. Нажми «Запустить».',
    allowedBlocks: ['закрасить'],
    fields: [{ cols: 1, rows: 1, robot: { x: 0, y: 0 }, walls: [], target: [{ x: 0, y: 0 }] }],
  },
  {
    id: 'three-right', title: 'Три шага',
    goal: 'Закрась все три клетки слева направо.',
    intro: 'Команда «вправо» двигает Робота на клетку вправо. Чередуй «закрасить» и «вправо».',
    allowedBlocks: ['вправо', 'закрасить'],
    fields: [{ cols: 3, rows: 1, robot: { x: 0, y: 0 }, walls: [], target: row(3) }],
  },
  {
    id: 'repeat-paint', title: 'Повтори',
    goal: 'Закрась пять клеток, не повторяя команды вручную.',
    intro: '«нц N раз … кц» повторяет команды N раз. Закрась первую клетку, затем повтори «вправо; закрасить».',
    allowedBlocks: ['вправо', 'закрасить', 'нц N раз'],
    stars: { efficiency: { maxCommands: 3, requireLoop: true } },
    fields: [{ cols: 5, rows: 1, robot: { x: 0, y: 0 }, walls: [], target: row(5) }],
  },
  {
    id: 'corridor', title: 'Коридор',
    goal: 'Закрась все клетки до стены справа.',
    intro: 'Длина заранее неизвестна — «нц пока справа свободно … кц» повторяет, пока есть куда идти.',
    allowedBlocks: ['вправо', 'закрасить', 'нц пока'],
    stars: { efficiency: { maxCommands: 3, requireLoop: true } },
    hints: ['Закрась клетку, потом «нц пока справа свободно { вправо; закрасить }».'],
    fields: [
      { cols: 5, rows: 1, robot: { x: 0, y: 0 }, walls: [], target: row(5) },
      { cols: 8, rows: 1, robot: { x: 0, y: 0 }, walls: [], target: row(8) },
      { cols: 3, rows: 1, robot: { x: 0, y: 0 }, walls: [], target: row(3) },
    ],
  },
  {
    id: 'wall-stop', title: 'До стенки',
    goal: 'Закрась клетки вправо, пока не упрёшься во внутреннюю стену.',
    stars: { efficiency: { maxCommands: 3, requireLoop: true } },
    hints: ['Стена бывает в разных местах — снова поможет «нц пока».'],
    fields: [
      { cols: 6, rows: 1, robot: { x: 0, y: 0 }, walls: ['V:3:0'], target: row(4) },
      { cols: 6, rows: 1, robot: { x: 0, y: 0 }, walls: ['V:4:0'], target: row(5) },
    ],
  },
  {
    id: 'left-walk', title: 'Налево',
    goal: 'Робот справа — закрась дорожку до левой стены.',
    stars: { efficiency: { maxCommands: 3, requireLoop: true } },
    fields: [
      { cols: 5, rows: 1, robot: { x: 4, y: 0 }, walls: [], target: row(5) },
      { cols: 8, rows: 1, robot: { x: 7, y: 0 }, walls: [], target: row(8) },
      { cols: 3, rows: 1, robot: { x: 2, y: 0 }, walls: [], target: row(3) },
    ],
  },
  {
    id: 'down-column', title: 'Столбик вниз',
    goal: 'Закрась клетки вниз до нижней стены.',
    stars: { efficiency: { maxCommands: 3, requireLoop: true } },
    fields: [
      { cols: 1, rows: 5, robot: { x: 0, y: 0 }, walls: [], target: col(5) },
      { cols: 1, rows: 8, robot: { x: 0, y: 0 }, walls: [], target: col(8) },
      { cols: 1, rows: 3, robot: { x: 0, y: 0 }, walls: [], target: col(3) },
    ],
  },
  {
    id: 'up-column', title: 'Столбик вверх',
    goal: 'Робот внизу — закрась столбик до верхней стены.',
    stars: { efficiency: { maxCommands: 3, requireLoop: true } },
    fields: [
      { cols: 1, rows: 5, robot: { x: 0, y: 4 }, walls: [], target: col(5) },
      { cols: 1, rows: 7, robot: { x: 0, y: 6 }, walls: [], target: col(7) },
      { cols: 1, rows: 3, robot: { x: 0, y: 2 }, walls: [], target: col(3) },
    ],
  },
  {
    id: 'down-wall', title: 'До дна',
    goal: 'Закрась вниз, пока не упрёшься во внутреннюю стену.',
    stars: { efficiency: { maxCommands: 3, requireLoop: true } },
    fields: [
      { cols: 1, rows: 6, robot: { x: 0, y: 0 }, walls: ['H:0:3'], target: col(4) },
      { cols: 1, rows: 6, robot: { x: 0, y: 0 }, walls: ['H:0:4'], target: col(5) },
    ],
  },
  {
    id: 'corner', title: 'Уголок',
    goal: 'Закрась дорожку вправо до стены, затем вниз до стены.',
    stars: { efficiency: { maxCommands: 5, requireLoop: true } },
    hints: ['Два цикла подряд: «нц пока справа свободно», потом «нц пока снизу свободно».'],
    fields: [
      { cols: 4, rows: 4, robot: { x: 0, y: 0 }, walls: [],
        target: [...row(4, 0), { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }] },
      { cols: 3, rows: 5, robot: { x: 0, y: 0 }, walls: [],
        target: [...row(3, 0), { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }] },
    ],
  },
  {
    id: 'corner-up', title: 'Уголок вверх',
    goal: 'Робот в левом нижнем углу — закрась вверх, затем вправо.',
    stars: { efficiency: { maxCommands: 5, requireLoop: true } },
    fields: [
      { cols: 4, rows: 4, robot: { x: 0, y: 3 }, walls: [],
        target: [...col(4, 0), { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }] },
      { cols: 3, rows: 5, robot: { x: 0, y: 4 }, walls: [],
        target: [...col(5, 0), { x: 1, y: 0 }, { x: 2, y: 0 }] },
    ],
  },
  {
    id: 'two-rows', title: 'Две полки',
    goal: 'Закрась верхнюю и нижнюю строки.',
    stars: { efficiency: { maxCommands: 7, requireLoop: true } },
    hints: ['Закрась верх, спустись вниз без закрашивания, закрась низ.'],
    fields: [
      { cols: 4, rows: 3, robot: { x: 0, y: 0 }, walls: [], target: [...row(4, 0), ...row(4, 2)] },
      { cols: 5, rows: 4, robot: { x: 0, y: 0 }, walls: [], target: [...row(5, 0), ...row(5, 3)] },
    ],
  },
  {
    id: 'perimeter', title: 'Рамка',
    goal: 'Закрась всю границу поля.',
    stars: { efficiency: { maxCommands: 9, requireLoop: true } },
    hints: ['Четыре цикла по сторонам: вправо, вниз, влево, вверх.'],
    fields: [
      { cols: 4, rows: 4, robot: { x: 0, y: 0 }, walls: [], target: perimeterCells(4, 4) },
      { cols: 5, rows: 3, robot: { x: 0, y: 0 }, walls: [], target: perimeterCells(5, 3) },
      { cols: 3, rows: 5, robot: { x: 0, y: 0 }, walls: [], target: perimeterCells(3, 5) },
    ],
  },
  {
    id: 'comb-if', title: 'Гребёнка',
    goal: 'Идя вправо, закрась только клетки, под которыми есть стена.',
    stars: { efficiency: { maxCommands: 2, requireLoop: true } },
    hints: ['Внутри «нц пока справа свободно» проверяй «если снизу стена то закрасить», затем «вправо».'],
    fields: [
      { cols: 6, rows: 2, robot: { x: 0, y: 0 }, walls: ['H:1:0', 'H:3:0'],
        target: [{ x: 1, y: 0 }, { x: 3, y: 0 }] },
      { cols: 6, rows: 2, robot: { x: 0, y: 0 }, walls: ['H:2:0', 'H:4:0'],
        target: [{ x: 2, y: 0 }, { x: 4, y: 0 }] },
    ],
  },
]
