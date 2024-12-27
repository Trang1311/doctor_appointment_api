import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ChatRoom } from '../schemas/chatroom.schema';
import { Message } from '../schemas/message.schema';
import { CreateChatRoomDto } from '../dto/create-chatroom.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { User } from '../schemas/user.schema';
import { Doctor } from '../schemas/doctor.schema';
import { MyGateway } from '../gateway/gateway';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @Inject(forwardRef(() => MyGateway)) private readonly myGateway: MyGateway,
  ) {}

  async createChatRoom(
    createChatRoomDto: CreateChatRoomDto,
  ): Promise<ChatRoom> {
    const doctorExists = await this.doctorModel.findById(
      createChatRoomDto.doctorId,
    );
    if (!doctorExists) {
      throw new NotFoundException('Không tìm thấy bác sĩ');
    }
    const userExists = await this.userModel.findById(createChatRoomDto.userId);
    if (!userExists) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const existingChatRoom = await this.chatRoomModel.findOne({
      doctorId: createChatRoomDto.doctorId,
      userId: createChatRoomDto.userId,
    });

    if (existingChatRoom) {
      return existingChatRoom;
    }

    const chatRoom = new this.chatRoomModel(createChatRoomDto);
    const savedChatRoom = await chatRoom.save();
    this.myGateway.notifyChatRoomCreated(savedChatRoom);
    return savedChatRoom;
  }

  async sendMessage(sendMessageDto: SendMessageDto): Promise<Message> {
    const chatRoom = await this.chatRoomModel.findById(
      sendMessageDto.chatRoomId,
    );
    if (!chatRoom) {
      throw new NotFoundException('Không tìm thấy phòng chat');
    }

    const isSenderAuthorized =
      sendMessageDto.senderId === chatRoom.doctorId.toString() ||
      sendMessageDto.senderId === chatRoom.userId.toString();

    if (!isSenderAuthorized) {
      throw new UnauthorizedException(
        'Bạn không có quyền gửi tin nhắn cho phòng này',
      );
    }

    const messageData = {
      content: sendMessageDto.content,
      senderId: sendMessageDto.senderId as string,
      chatRoom: chatRoom._id.toString(),
      timestamp: new Date(),
    };

    const message = new this.messageModel(messageData);
    const savedMessage = await message.save();
    chatRoom.messages.push(savedMessage.id);

    await chatRoom.save();
    this.myGateway.notifyNewMessage(savedMessage, sendMessageDto.chatRoomId);
    return savedMessage;
  }

  async getMessages(chatRoomId: string): Promise<Message[]> {
    const messages = await this.messageModel
      .find({ chatRoom: chatRoomId })
      .sort({ timestamp: 1 })
      .exec();
    return messages;
  }
  async removeChatroom(chatRoomId: string): Promise<void> {
    if (!chatRoomId) {
      throw new NotFoundException('ID phòng chat không được cung cấp');
    }
    if (!isValidObjectId(chatRoomId)) {
      throw new NotFoundException(`ID phòng chat không hợp lệ: ${chatRoomId}`);
    }

    const result = await this.chatRoomModel
      .findByIdAndDelete(chatRoomId)
      .exec();
    if (!result) {
      throw new NotFoundException(
        `Phòng chat với ID ${chatRoomId} không tồn tại`,
      );
    }
  }

  async getChatroomByIdUser(userId: string): Promise<ChatRoom[]> {
    const chatRooms = await this.chatRoomModel.find({
      $or: [{ userId }, { doctorId: userId }],
    });

    if (!chatRooms.length) {
      throw new NotFoundException(
        'Không tìm thấy phòng chat cho người dùng: ',
        userId,
      );
    }
    return chatRooms;
  }
}
