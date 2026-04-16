import type { ReactNode } from 'react';
import {
  BadgeAlert,
  BadgeCheck,
  Banknote,
  BarChart3,
  Blocks,
  Building2,
  CalendarClock,
  Camera,
  ChartNoAxesCombined,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Component,
  CreditCard,
  Database,
  FileCheck,
  FileCheck2,
  FileSignature,
  FileText,
  FileWarning,
  Fingerprint,
  Gamepad2,
  Globe,
  Hammer,
  Handshake,
  Headphones,
  Landmark,
  LibraryBig,
  Lightbulb,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  MonitorPlay,
  MousePointerClick,
  Network,
  PiggyBank,
  Receipt,
  Rocket,
  ScanFace,
  Search,
  SearchX,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Shuffle,
  Signal,
  SignalLow,
  Smartphone,
  Star,
  Store,
  Target,
  Timer,
  TrendingDown,
  Truck,
  UserCheck,
  UserMinus,
  UserRoundX,
  UserX,
  Video,
  Zap,
} from 'lucide-react';

export const cmsIconNames = [
  'badgeAlert',
  'badgeCheck',
  'banknote',
  'barChart3',
  'blocks',
  'building2',
  'calendarClock',
  'camera',
  'chartNoAxesCombined',
  'checkCircle2',
  'circleDollarSign',
  'clock',
  'component',
  'creditCard',
  'database',
  'fileCheck',
  'fileCheck2',
  'fileSignature',
  'fileText',
  'fileWarning',
  'fingerprint',
  'gamepad2',
  'globe',
  'hammer',
  'handshake',
  'headphones',
  'landmark',
  'libraryBig',
  'lightbulb',
  'lock',
  'mail',
  'mapPin',
  'messageSquare',
  'monitorPlay',
  'mousePointerClick',
  'network',
  'piggyBank',
  'receipt',
  'rocket',
  'scanFace',
  'search',
  'searchX',
  'settings',
  'shield',
  'shieldAlert',
  'shieldCheck',
  'shoppingCart',
  'shuffle',
  'signal',
  'signalLow',
  'smartphone',
  'star',
  'store',
  'target',
  'timer',
  'trendingDown',
  'truck',
  'userCheck',
  'userMinus',
  'userRoundX',
  'userX',
  'video',
  'zap',
] as const;

export type CmsIconName = (typeof cmsIconNames)[number];

const baseProps = { size: 24, strokeWidth: 1.5 };
const smallProps = { size: 20, strokeWidth: 1.5 };
const largeProps = { size: 28, strokeWidth: 1.5 };
const xlProps = { size: 32, strokeWidth: 1.5 };

export function renderCmsIcon(name: CmsIconName, size: 'small' | 'default' | 'large' | 'xl' = 'default'): ReactNode {
  const props = size === 'small' ? smallProps : size === 'large' ? largeProps : size === 'xl' ? xlProps : baseProps;

  switch (name) {
    case 'badgeAlert':
      return <BadgeAlert {...props} />;
    case 'badgeCheck':
      return <BadgeCheck {...props} />;
    case 'banknote':
      return <Banknote {...props} />;
    case 'barChart3':
      return <BarChart3 {...props} />;
    case 'blocks':
      return <Blocks {...props} />;
    case 'building2':
      return <Building2 {...props} />;
    case 'calendarClock':
      return <CalendarClock {...props} />;
    case 'camera':
      return <Camera {...props} />;
    case 'chartNoAxesCombined':
      return <ChartNoAxesCombined {...props} />;
    case 'checkCircle2':
      return <CheckCircle2 {...props} />;
    case 'circleDollarSign':
      return <CircleDollarSign {...props} />;
    case 'clock':
      return <Clock {...props} />;
    case 'component':
      return <Component {...props} />;
    case 'creditCard':
      return <CreditCard {...props} />;
    case 'database':
      return <Database {...props} />;
    case 'fileCheck':
      return <FileCheck {...props} />;
    case 'fileCheck2':
      return <FileCheck2 {...props} />;
    case 'fileSignature':
      return <FileSignature {...props} />;
    case 'fileText':
      return <FileText {...props} />;
    case 'fileWarning':
      return <FileWarning {...props} />;
    case 'fingerprint':
      return <Fingerprint {...props} />;
    case 'gamepad2':
      return <Gamepad2 {...props} />;
    case 'globe':
      return <Globe {...props} />;
    case 'hammer':
      return <Hammer {...props} />;
    case 'handshake':
      return <Handshake {...props} />;
    case 'headphones':
      return <Headphones {...props} />;
    case 'landmark':
      return <Landmark {...props} />;
    case 'libraryBig':
      return <LibraryBig {...props} />;
    case 'lightbulb':
      return <Lightbulb {...props} />;
    case 'lock':
      return <Lock {...props} />;
    case 'mail':
      return <Mail {...props} />;
    case 'mapPin':
      return <MapPin {...props} />;
    case 'messageSquare':
      return <MessageSquare {...props} />;
    case 'monitorPlay':
      return <MonitorPlay {...props} />;
    case 'mousePointerClick':
      return <MousePointerClick {...props} />;
    case 'network':
      return <Network {...props} />;
    case 'piggyBank':
      return <PiggyBank {...props} />;
    case 'receipt':
      return <Receipt {...props} />;
    case 'rocket':
      return <Rocket {...props} />;
    case 'scanFace':
      return <ScanFace {...props} />;
    case 'search':
      return <Search {...props} />;
    case 'searchX':
      return <SearchX {...props} />;
    case 'settings':
      return <Settings {...props} />;
    case 'shield':
      return <Shield {...props} />;
    case 'shieldAlert':
      return <ShieldAlert {...props} />;
    case 'shieldCheck':
      return <ShieldCheck {...props} />;
    case 'shoppingCart':
      return <ShoppingCart {...props} />;
    case 'shuffle':
      return <Shuffle {...props} />;
    case 'signal':
      return <Signal {...props} />;
    case 'signalLow':
      return <SignalLow {...props} />;
    case 'smartphone':
      return <Smartphone {...props} />;
    case 'star':
      return <Star {...props} />;
    case 'store':
      return <Store {...props} />;
    case 'target':
      return <Target {...props} />;
    case 'timer':
      return <Timer {...props} />;
    case 'trendingDown':
      return <TrendingDown {...props} />;
    case 'truck':
      return <Truck {...props} />;
    case 'userCheck':
      return <UserCheck {...props} />;
    case 'userMinus':
      return <UserMinus {...props} />;
    case 'userRoundX':
      return <UserRoundX {...props} />;
    case 'userX':
      return <UserX {...props} />;
    case 'video':
      return <Video {...props} />;
    case 'zap':
      return <Zap {...props} />;
  }
}
