'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { Link as LinkType } from '@/lib/definitions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Edit, Copy, Link as LinkIcon, BarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { deleteLinkAction, updateLinkAction } from '@/lib/actions';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { SubmitButton } from './submit-button';

type SerializedLink = Omit<LinkType, 'createdAt'> & { createdAt: string };

export default function DashboardClient({ initialLinks }: { initialLinks: SerializedLink[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [editingLink, setEditingLink] = useState<SerializedLink | null>(null);
  const { toast } = useToast();
  
  const [updateState, updateDispatch] = useFormState(updateLinkAction, { message: null, errors: {} });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!', description: text });
  };
  
  const getFullShortUrl = (shortCode: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.protocol}//${window.location.host}/${shortCode}`;
  }

  const handleUpdate = async (formData: FormData) => {
    updateDispatch(formData);
    const id = formData.get('id') as string;
    const longUrl = formData.get('longUrl') as string;
    const shortCode = formData.get('shortCode') as string;

    // Optimistic UI update
    setLinks(prevLinks => prevLinks.map(l => l.id === id ? {...l, longUrl, shortCode} : l));
    setEditingLink(null);
    toast({ title: 'Link updated successfully!' });
  };
  
  const handleDelete = async (id: string) => {
    // Optimistic UI update
    setLinks(prevLinks => prevLinks.filter(l => l.id !== id));
    await deleteLinkAction(id);
    toast({ title: 'Link deleted successfully!' });
  }

  return (
    <>
      <Card>
        <CardContent>
          {links.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short Link</TableHead>
                  <TableHead className="hidden md:table-cell">Original URL</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Date</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">
                      <a
                        href={getFullShortUrl(link.shortCode)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-primary flex items-center gap-2"
                      >
                         <LinkIcon className="h-4 w-4 shrink-0" />
                        <span className="truncate max-w-[120px] sm:max-w-[200px]">{getFullShortUrl(link.shortCode).replace(/^https?:\/\//, '')}</span>
                      </a>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="truncate block max-w-xs">{link.longUrl}</span>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                        <BarChart className="h-4 w-4 text-muted-foreground"/>
                        {link.clicks}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => copyToClipboard(getFullShortUrl(link.shortCode))}>
                            <Copy className="mr-2 h-4 w-4"/> Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setEditingLink(link)}>
                            <Edit className="mr-2 h-4 w-4"/> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                                    <Trash2 className="mr-2 h-4 w-4"/> Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your link and its data.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(link.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold">No links yet</h3>
              <p className="text-muted-foreground mt-2">Create your first short link from the homepage!</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          {editingLink && (
            <form action={handleUpdate} className="space-y-4">
              <input type="hidden" name="id" value={editingLink.id} />
              <div className="space-y-2">
                <Label htmlFor="longUrl">Original URL</Label>
                <Input id="longUrl" name="longUrl" defaultValue={editingLink.longUrl} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortCode">Short Code</Label>
                <Input id="shortCode" name="shortCode" defaultValue={editingLink.shortCode} />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancel</Button>
                </DialogClose>
                <SubmitButton>Save Changes</SubmitButton>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
