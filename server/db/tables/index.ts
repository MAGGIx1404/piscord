import * as auditLog from "./audit-log";
import * as badge from "./badge";
import * as channelPermission from "./channel-permission";
import * as channel from "./channel";
import * as communityInvite from "./community-invite";
import * as communityMember from "./community-member";
import * as communityRule from "./community-rule";
import * as communityTag from "./community-tag";
import * as community from "./community";
import * as documentCollaborator from "./document-collaborator";
import * as documentComment from "./document-comment";
import * as documentView from "./document-view";
import * as document from "./document";
import * as emoji from "./emoji";
import * as folder from "./folder";
import * as friendship from "./friendship";
import * as messageMention from "./message-mention";
import * as messageReaction from "./message-reaction";
import * as message from "./message";
import * as notification from "./notification";
import * as tag from "./tag";
import * as userBadge from "./user-badge";
import * as user from "./user";
import * as workspace from "./workspace";
import * as session from "./session";

export type Database = auditLog.PartialDB &
  badge.PartialDB &
  channelPermission.PartialDB &
  channel.PartialDB &
  communityInvite.PartialDB &
  communityMember.PartialDB &
  communityRule.PartialDB &
  communityTag.PartialDB &
  community.PartialDB &
  documentCollaborator.PartialDB &
  documentComment.PartialDB &
  documentView.PartialDB &
  document.PartialDB &
  emoji.PartialDB &
  folder.PartialDB &
  friendship.PartialDB &
  messageMention.PartialDB &
  messageReaction.PartialDB &
  message.PartialDB &
  notification.PartialDB &
  tag.PartialDB &
  userBadge.PartialDB &
  user.PartialDB &
  workspace.PartialDB &
  session.PartialDB;
