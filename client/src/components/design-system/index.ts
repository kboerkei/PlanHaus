// Unified Design System Exports
// This ensures all components use the same design tokens and variants

// Core Components
export { Button } from './Button';
export { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from './Card';
export { Input } from '../ui/input';
export { ThemeToggle } from './ThemeToggle';

// Design Tokens
export { colors, typography, spacing, borderRadius, shadows, animation, componentVariants, breakpoints } from '../../design-system/tokens';

// Utility Components
export { SectionHeader } from './SectionHeader';

// Re-export commonly used UI components with consistent styling
export { Badge } from '../ui/badge';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
export { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
export { Progress } from '../ui/progress';
export { Alert, AlertDescription } from '../ui/alert';
export { Checkbox } from '../ui/checkbox';
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
export { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
export { Skeleton } from '../ui/skeleton';
export { Separator } from '../ui/separator';
export { Switch } from '../ui/switch';
export { Textarea } from '../ui/textarea';
export { Label } from '../ui/label';
export { RadioGroup, RadioGroupItem } from '../ui/radio-group';
export { Slider } from '../ui/slider';
export { Calendar } from '../ui/calendar';
export { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
export { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
export { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '../ui/navigation-menu';
export { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from '../ui/breadcrumb';
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '../ui/toast';
export { Toaster } from '../ui/toaster';