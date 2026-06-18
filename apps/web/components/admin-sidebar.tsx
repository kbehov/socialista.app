import { DatabaseIcon, LayoutDashboardIcon, PictureInPictureIcon } from 'lucide-react'

const items = [
  {
    title: 'Dashboard',
    url: '/manager',
    icon: <LayoutDashboardIcon />,
  },
  {
    title: 'Database',
    url: '/manager/database',
    icon: <DatabaseIcon />,
    items: [
      {
        title: 'Inspiration',
        url: '/manager/database/inspiration',
        icon: <PictureInPictureIcon />,
      },
    ],
  },
]
