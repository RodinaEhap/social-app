import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentsService } from '../../../../core/auth/services/comment.service';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit {
  private readonly commentsService = inject(CommentsService);

  @Input({ required: true }) postId!: string;
  comments: any[] = [];
  commentContent = '';
  replyContent = '';
  expandedReplyId: string | null = null;

  editingCommentId: string | null = null;
  editContent = '';

  ngOnInit() {
    this.loadComments();
  }
  loadComments() {
    this.commentsService.getPostComments(this.postId).subscribe({
      next: (res) => {
        console.log('All Comments:', res.data);
        this.comments = res.data.comments.map((c: any) => ({
          ...c,
          showReplies: false,
          replies: [],
        }));
      },
      error: (err) => console.error('Error:', err),
    });
  }

  toggleLike(comment: any) {
    this.commentsService.likeComment(this.postId, comment._id).subscribe({
      next: (res: any) => {
        console.log('Response:', res);

        if (res.data) {
          comment.isLiked = res.data.liked;
          comment.likesCount = res.data.likesCount;
        }
      },
      error: (err) => console.error('Like Error:', err),
    });
  }

  startEdit(comment: any) {
    console.log('Edit for Comment:', comment._id);
    this.editingCommentId = comment._id;
    this.editContent = comment.content;
  }

  saveUpdate(comment: any) {
    if (!this.editContent.trim()) return;
    this.commentsService.updateComment(this.postId, comment._id, this.editContent).subscribe({
      next: (res) => {
        console.log('Success:', res.data);
        comment.content = this.editContent;
        this.editingCommentId = null;
      },
      error: (err) => console.error('Error:', err),
    });
  }

  deleteComment(id: string) {
    this.commentsService.deleteComment(this.postId, id).subscribe({
      next: (res) => {
        console.log('Success:', res);
        this.comments = this.comments.filter((c) => c._id !== id);
      },
      error: (err) => console.error('Error:', err),
    });
  }

  sendComment() {
    if (!this.commentContent.trim()) return;
    const fd = new FormData();
    fd.append('content', this.commentContent);
    this.commentsService.createComment(fd, this.postId).subscribe({
      next: (res) => {
        console.log('Created:', res.data);
        this.commentContent = '';
        this.loadComments();
      },
      error: (err) => console.error('Error:', err),
    });
  }

  loadReplies(comment: any) {
    if (comment.showReplies) {
      comment.showReplies = false;
    } else {
      console.log('Replies for Comment:', comment._id);
      this.commentsService.getCommentReplies(this.postId, comment._id).subscribe({
        next: (res) => {
          console.log('Replies:', res.data.replies);
          comment.replies = res.data.replies;
          comment.showReplies = true;
        },
        error: (err) => console.error('Error:', err),
      });
    }
  }

  sendReply(commentId: string) {
    const fd = new FormData();
    fd.append('content', this.replyContent);
    console.log('Reply to:', commentId);
    this.commentsService.createReply(fd, this.postId, commentId).subscribe({
      next: (res) => {
        console.log('Success:', res.data);
        this.replyContent = '';
        this.expandedReplyId = null;
        const comment = this.comments.find((c) => c._id === commentId);
        if (comment) {
          comment.showReplies = false;
          this.loadReplies(comment);
        }
      },
      error: (err) => console.error('Error:', err),
    });
  }

  cancelEdit() {
    this.editingCommentId = null;
  }

  toggleReplyField(id: string) {
    this.expandedReplyId = this.expandedReplyId === id ? null : id;
  }
}
