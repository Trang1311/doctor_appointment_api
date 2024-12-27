import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('recommend')
@Controller('recommend')
export class RecController{}