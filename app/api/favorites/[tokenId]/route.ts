// app/api/favorites/[tokenId]/route.ts
// API route for deleting a specific favorite
// Uses SIWE session authentication instead of per-request signatures

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/session-auth';

// DELETE /api/favorites/[tokenId] - Remove a favorite
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    // Get authenticated wallet address from session
    const walletAddress = await requireAuth();
    
    const { tokenId } = await params;

    if (!tokenId) {
      return NextResponse.json(
        { success: false, error: 'Missing tokenId parameter' },
        { status: 400 }
      );
    }

    // Delete the favorite
    const { error } = await supabaseServer
      .from('favorites')
      .delete()
      .eq('wallet_address', walletAddress)
      .eq('token_id', tokenId);

    if (error) {
      console.error('Database error deleting favorite:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to remove favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Favorite removed successfully',
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/favorites/[tokenId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

